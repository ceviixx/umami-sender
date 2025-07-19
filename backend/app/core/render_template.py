# app/core/mail_template.py

from jinja2 import Template

def render_mail_template(template_str: str, context: dict) -> str:
    template = Template(template_str)
    return template.render(**context)

def render_webhook_template(template_str: str, context: dict) -> str:
    template = Template(template_str)
    return template.render(**context)