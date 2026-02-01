import hmac

import hashlib

import subprocess

from django.conf import settings

from django.http import HttpResponse, HttpResponseForbidden

from django.views.decorators.csrf import csrf_exempt

from django.views.decorators.http import require_POST


@csrf_exempt
@require_POST
def github_deploy(request):

	signature = request.headers.get("X-Hub-Signature-256")

	payload = request.body

	secret = settings.GITHUB_WEBHOOK_SECRET.encode()

	mac = hmac.new(secret, payload, hashlib.sha256)

	expected_signature = "sha256=" + mac.hexdigest()

	if not signature or not hmac.compare_digest(signature, expected_signature):

		return HttpResponseForbidden("Invalid signature")

	subprocess.Popen(

		["/home/ubuntu/digistore/deploy.sh"],

		stdout=subprocess.DEVNULL,
		
		stderr=subprocess.DEVNULL
	)


	return HttpResponse("Deploy triggered", status=200)
