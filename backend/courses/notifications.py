from .models import Notification


def display_name(user):
    return user.get_full_name().strip() or 'Unknown User'


def notify(recipient, course, kind, message):
    return Notification.objects.create(
        recipient=recipient,
        course=course,
        kind=kind,
        message=message,
    )
