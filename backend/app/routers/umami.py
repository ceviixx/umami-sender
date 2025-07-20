from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.umami import Umami, UmamiType
from app.schemas.umami import UmamiInstanceCreate, UmamiInstanceOut, UmamiInstanceUpdate
from hashlib import sha256
import requests
import os
import os

CLOUD_HOSTNAME = os.getenv("CLOUD_HOSTNAME", "https://api.umami.is/v1")
router = APIRouter(prefix="/umami", tags=["umami"])

# 🔐 Validierung und Speicherung
@router.post("/", response_model=UmamiInstanceOut)
def add_instance(data: UmamiInstanceCreate, db: Session = Depends(get_db)):
    # 🧪 Cloud: Prüfen, ob API-Key gültig ist
    if data.type == "cloud":
        if not data.api_key:
            raise HTTPException(status_code=400, detail="API key required for cloud instances.")

        try:
            res = requests.get(
                f"{CLOUD_HOSTNAME}/me",
                headers={"x-umami-api-key": data.api_key},
                timeout=5,
            )
            res.raise_for_status()
        except requests.RequestException:
            raise HTTPException(status_code=400, detail="Ungültiger API-Key für Umami Cloud.")

        instance = Umami(
            name=data.name,
            type=data.type,
            api_key=data.api_key,
            hostname=None,
            username=None,
            password_hash=None,
            bearer_token=None,
        )

    # 🧪 Self-Hosted: Login + Bearer-Token speichern
    elif data.type == "self_hosted":
        hostname = data.hostname
        username = data.username
        password = data.password

        if not (hostname and username and password):
            raise HTTPException(status_code=400, detail="Hostname, Benutzername und Passwort erforderlich.")

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
                raise HTTPException(status_code=400, detail="Login erfolgreich, aber kein Token erhalten.")

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

            print("❌ Fehler bei Self-Hosted-Verbindung:")
            print(f"URL: {login_url}")
            print(f"Status Code: {status}")
            print(f"Response Body: {body}")

            raise HTTPException(
                status_code=400,
                detail=f"Fehler beim Login ({status}): {body}"
            )

        instance = Umami(
            name=data.name,
            type=data.type,
            hostname=data.hostname,
            username=data.username,
            password_hash=sha256(data.password.encode()).hexdigest(),
            bearer_token=token,
            api_key=None
        )

    else:
        raise HTTPException(status_code=400, detail="Unbekannter Instanztyp.")

    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance

# 📥 Alle Instanzen
@router.get("/", response_model=list[UmamiInstanceOut])
def list_instances(db: Session = Depends(get_db)):
    return db.query(Umami).all()

# 📄 Einzelne Instanz abrufen
@router.get("/{instance_id}", response_model=UmamiInstanceOut)
def get_instance(instance_id: int, db: Session = Depends(get_db)):
    instance = db.query(Umami).filter(Umami.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return instance


# ✏️ Update
@router.put("/{instance_id}", response_model=UmamiInstanceOut)
def update_instance(instance_id: int, data: UmamiInstanceUpdate, db: Session = Depends(get_db)):
    instance = db.query(Umami).filter(Umami.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")

    update_data = data.dict(exclude_unset=True)

    # 🔍 Wenn Typ mitgeschickt wird, validieren
    instance_type = update_data.get("type", instance.type)

    if instance_type == "cloud":
        api_key = update_data.get("api_key", instance.api_key)
        if not api_key:
            raise HTTPException(status_code=400, detail="API key required for cloud instances.")

        try:
            res = requests.get(
                f"{CLOUD_HOSTNAME}/me",
                headers={"x-umami-api-key": api_key},
                timeout=5,
            )
            res.raise_for_status()
        except requests.RequestException:
            raise HTTPException(status_code=400, detail="Ungültiger API-Key für Umami Cloud.")

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
            raise HTTPException(status_code=400, detail="Hostname, Benutzername und Passwort erforderlich.")

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
                raise HTTPException(status_code=400, detail="Login erfolgreich, aber kein Token erhalten.")

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

            print("❌ Fehler bei Self-Hosted-Verbindung:")
            print(f"URL: {login_url}")
            print(f"Status Code: {status}")
            print(f"Response Body: {body}")

            raise HTTPException(
                status_code=400,
                detail=f"Fehler beim Login ({status}): {body}"
            )

        update_data["bearer_token"] = token
        if password:
            update_data["password_hash"] = sha256(password.encode()).hexdigest()
        else:
            update_data.pop("password_hash", None)
        update_data["api_key"] = None

    else:
        raise HTTPException(status_code=400, detail="Unbekannter Instanztyp.")

    for field, value in update_data.items():
        setattr(instance, field, value)

    db.commit()
    db.refresh(instance)
    return instance


# ❌ Löschen
@router.delete("/{instance_id}")
def delete_instance(instance_id: int, db: Session = Depends(get_db)):
    instance = db.query(Umami).filter(Umami.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")

    db.delete(instance)
    db.commit()
    return {"detail": "Deleted"}


# 🌐 Websites einer Instanz abrufen (sicher)
@router.get("/{instance_id}/websites")
def get_websites_for_instance(instance_id: int, db: Session = Depends(get_db)):
    instance = db.query(Umami).filter(Umami.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")

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
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Websites: {str(e)}")