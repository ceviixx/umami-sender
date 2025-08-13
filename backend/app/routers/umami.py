from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.umami import Umami, UmamiType
from app.schemas.umami import UmamiInstanceCreate, UmamiInstanceOut, UmamiInstanceUpdate
from hashlib import sha256
import requests
import os
from app.utils.responses import send_status_response

from app.utils.security import Security

CLOUD_HOSTNAME = os.getenv("CLOUD_HOSTNAME", "https://api.umami.is/v1")
router = APIRouter(prefix="/umami", tags=["umami"])

@router.post("", response_model=UmamiInstanceOut)
def add_instance(request: Request, data: UmamiInstanceCreate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    if data.type == "cloud":
        if not data.api_key:
            return send_status_response(
                code="API_KEY_REQUIRED",
                message="API key required for cloud instances",
                status=400,
                detail="You must provide an API key when accessing cloud-based Umami instances."
            )


        try:
            res = requests.get(
                f"{CLOUD_HOSTNAME}/me",
                headers={"x-umami-api-key": data.api_key},
                timeout=5,
            )
            res.raise_for_status()
        except requests.RequestException:
            return send_status_response(
                code="INVALID_API_KEY",
                message="Invalid API key for Umami Cloud",
                status=400,
                detail="The provided API key is invalid or not authorized to access this Umami Cloud instance."
            )

        instance = Umami(
            user_id=user.id,
            name=data.name,
            type=data.type,
            api_key=data.api_key,
            hostname=None,
            username=None,
            password_hash=None,
            bearer_token=None,
        )

    elif data.type == "self_hosted":
        hostname = data.hostname
        username = data.username
        password = data.password

        if not (hostname and username and password):
            return send_status_response(
                code="SELF_HOSTED_CREDENTIALS_REQUIRED",
                message="Missing self-hosted credentials",
                status=400,
                detail="Hostname, username, and password are required for self-hosted instances."
            )


        try:
            login_url = f"{hostname}/api/auth/login"
            res = requests.post(
                login_url,
                headers={
                    "Content-Type": "application/json"
                },
                json={
                    "username": username,
                    "password": password or "",
                },
                timeout=5
            )
            res.raise_for_status()
            token = res.json().get("token")
            if not token:
                return send_status_response(
                    code="LOGIN_SUCCESS_NO_TOKEN",
                    message="Login successful, but no token received",
                    status=400,
                    detail="Login was successful, but no access token was returned by the system."
                )


            verify_url = f"{hostname}/api/auth/verify"
            verify_res = requests.post(
                verify_url, 
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=5
            )
            verify_res.raise_for_status()

        except requests.RequestException as e:
            status = getattr(e.response, "status_code", "unbekannt")
            body = getattr(e.response, "text", "Keine Antwort erhalten")

            return send_status_response(
                code="LOGIN_REMOTE_ERROR",
                message="Login failed due to a remote server error.",
                status=400,
                detail=f"Login failed with status {status}: {body}"
            )


        instance = Umami(
            user_id=user.id,
            name=data.name,
            type=data.type,
            hostname=data.hostname,
            username=data.username,
            password_hash=sha256(data.password.encode()).hexdigest(),
            bearer_token=token,
            api_key=None
        )

    else:
        return send_status_response(
            code="UNKNOWN_INSTANCE_TYPE",
            message="Unknown instance type.",
            status=400,
            detail="The provided instance type is not recognized or supported."
        )


    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance

@router.get("", response_model=list[UmamiInstanceOut])
def list_instances(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    return db.query(Umami).filter(Umami.user_id == user.id).all()

@router.get("/{instance_id}", response_model=UmamiInstanceOut)
def get_instance(request: Request, instance_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    instance = db.query(Umami).filter(Umami.id == instance_id).first()
    
    if instance.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to instance",
            status=403,
            detail=f"User {user.id} is not allowed to access instance {instance_id}."
        )

    if not instance:
        return send_status_response(
            code="INSTANCE_NOT_FOUND",
            message="Instance not found",
            status=404,
            detail=f"No instance with id {instance_id} exists."
        )
    
    return instance

@router.put("/{instance_id}", response_model=UmamiInstanceOut)
def update_instance(request: Request, instance_id: str, data: UmamiInstanceUpdate, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    instance = db.query(Umami).filter(Umami.id == instance_id).first()

    if instance.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Unauthorized access to instance",
            status=403,
            detail=f"User {user.id} is not allowed to update instance {instance_id}."
        )
    
    if not instance:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: instance not found",
            status=404,
            detail=f"Instance with id {instance_id} does not exist."
        )

    update_data = data.dict(exclude_unset=True)

    # 🔍 Wenn Typ mitgeschickt wird, validieren
    instance_type = update_data.get("type", instance.type)

    if instance_type == "cloud":
        api_key = update_data.get("api_key", instance.api_key)
        if not api_key:
            return send_status_response(
                code="API_KEY_REQUIRED",
                message="API key required for cloud instances",
                status=400,
                detail="You must provide an API key when accessing cloud-based Umami instances."
            )

        try:
            res = requests.get(
                f"{CLOUD_HOSTNAME}/me",
                headers={"x-umami-api-key": api_key},
                timeout=5,
            )
            res.raise_for_status()
        except requests.RequestException:
            return send_status_response(
                code="INVALID_API_KEY",
                message="Invalid API key for Umami Cloud",
                status=400,
                detail="The provided API key is invalid or not authorized to access this Umami Cloud instance."
            )

        update_data["api_key"] = api_key
        update_data["hostname"] = None
        update_data["username"] = None
        update_data["password_hash"] = None
        update_data["bearer_token"] = None

    elif instance_type == "self_hosted":
        hostname = update_data.get("hostname", instance.hostname)
        username = update_data.get("username", instance.username)
        password = update_data.get("password", None) 

        if not (hostname and username and (password or instance.password_hash)):
            return send_status_response(
                code="SELF_HOSTED_CREDENTIALS_REQUIRED",
                message="Missing self-hosted credentials",
                status=400,
                detail="Hostname, username, and password are required for self-hosted instances."
            )

        try:
            login_url = f"{hostname}/api/auth/login"
            res = requests.post(
                login_url,
                headers={
                    "Content-Type": "application/json"
                },
                json={
                    "username": username,
                    "password": password or "",
                },
                timeout=5
            )
            res.raise_for_status()
            token = res.json().get("token")
            if not token:
                return send_status_response(
                    code="LOGIN_SUCCESS_NO_TOKEN",
                    message="Login successful, but no token received",
                    status=400,
                    detail="Login was successful, but no access token was returned by the system."
                )

            verify_url = f"{hostname}/api/auth/verify"
            verify_res = requests.post(
                verify_url, 
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                timeout=5
            )
            verify_res.raise_for_status()

        except requests.RequestException as e:
            status = getattr(e.response, "status_code", "unbekannt")
            body = getattr(e.response, "text", "Keine Antwort erhalten")

            return send_status_response(
                code="LOGIN_REMOTE_ERROR",
                message="Login failed due to a remote server error.",
                status=400,
                detail=f"Login failed with status {status}: {body}"
            )
        
        update_data["bearer_token"] = token
        if password:
            update_data["password_hash"] = sha256(password.encode()).hexdigest()
        else:
            update_data.pop("password_hash", None)
        update_data["api_key"] = None

    else:
        return send_status_response(
            code="UNKNOWN_INSTANCE_TYPE",
            message="Unknown instance type.",
            status=400,
            detail="The provided instance type is not recognized or supported."
        )

    for field, value in update_data.items():
        setattr(instance, field, value)

    db.commit()
    db.refresh(instance)
    return instance

@router.delete("/{instance_id}")
def delete_instance(request: Request, instance_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    instance = db.query(Umami).filter(Umami.id == instance_id).first()

    if instance.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED",
            message="Cannot delete: unauthorized",
            status=403,
            detail=f"User {user.id} is not the owner of instance {instance_id}."
        )
    
    if not instance:
        return send_status_response(
            code="INSTANCE_NOT_FOUND",
            message="Instance not found",
            status=404,
            detail=f"No instance with id {instance_id} exists."
        )

    db.delete(instance)
    db.commit()
    return {"detail": "Deleted"}

@router.get("/{instance_id}/websites")
def get_websites_for_instance(request: Request, instance_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    instance = db.query(Umami).filter(Umami.id == instance_id).first()

    if instance.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED_ACCESS",
            message="Unauthorized access.",
            status=403,
            detail="You are not allowed to access this instance."
        )

    if not instance:
        return send_status_response(
            code="INSTANCE_NOT_FOUND",
            message="Instance not found",
            status=404,
            detail=f"No instance with id {instance_id} exists."
        )
    
    if instance.type == UmamiType.cloud:
        base_url = os.getenv("CLOUD_HOSTNAME", "https://api.umami.is/v1")
        headers = {"x-umami-api-key": instance.api_key}
    else:
        base_url = instance.hostname + "/api"
        headers = {"Authorization": f"Bearer {instance.bearer_token}"}

    try:
        response = requests.get(f"{base_url}/websites", headers=headers)
        response.raise_for_status()
        return response.json().get("data", [])
    except Exception as e:
        return send_status_response(
            code="FETCH_WEBSITES_FAILED",
            message="Failed to fetch websites.",
            status=500,
            detail=f"An error occurred while retrieving websites: {str(e)}"
        )

@router.get("/{instance_id}/reports")
def get_reports_for_website_id(request: Request, instance_id: str,website_id: str = Query(..., description="The ID of the desired website"), db: Session = Depends(get_db)):
    user = Security(request).get_user()
    instance = db.query(Umami).filter(Umami.id == instance_id).first()

    if instance.user_id != user.id:
        return send_status_response(
            code="UNAUTHORIZED_ACCESS",
            message="You are not authorized to access this instance.",
            status=403,
            detail=f"User {user.id} does not own instance {instance.id}."
        )

    if not instance:
        return send_status_response(
            code="INSTANCE_NOT_FOUND",
            message="Instance not found.",
            status=404,
            detail=f"No instance with ID {instance_id} exists."
        )

    if instance.type == UmamiType.cloud:
        base_url = os.getenv("CLOUD_HOSTNAME", "https://api.umami.is/v1")
        headers = {"x-umami-api-key": instance.api_key}
    else:
        base_url = instance.hostname + "/api"
        headers = {"Authorization": f"Bearer {instance.bearer_token}"}

    params = {"website_id": website_id}

    try:
        response = requests.get(f"{base_url}/reports", headers=headers, params=params)
        response.raise_for_status()
        return response.json().get("data", [])
    except Exception as e:
        return send_status_response(
            code="FETCH_REPORTS_FAILED",
            message="Failed to fetch reports.",
            status=500,
            detail=f"An error occurred while retrieving reports: {str(e)}"
        )
