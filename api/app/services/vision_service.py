import base64
import json
from pathlib import Path

from groq import AsyncGroq

from app.config import settings
from app.models.assessment import VisualObservation


VISION_SYSTEM_PROMPT = """
You are the visual evidence analysis component of Red Scale.

Analyze the supplied aviation image and identify only things that
are directly observable.

You MUST return a valid JSON object with exactly this structure:

{
  "observations": [
    {
      "category": "string",
      "finding": "string",
      "confidence": 0.0
    }
  ]
}

Rules:

- Return JSON only.
- Do not use markdown.
- Do not include explanations outside the JSON object.
- Do not calculate a risk score.
- Do not assign an overall pilot rating.
- Do not invent information that cannot be seen.
- Only report visually observable evidence.
- Confidence must be a number between 0 and 1.
- If there are no meaningful observations, return:
  {"observations": []}
""".strip()


def _image_to_data_url(image_path: Path) -> str:
    """
    Convert an image file into a base64 data URL.
    """

    suffix = image_path.suffix.lower()

    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }

    mime_type = mime_types.get(suffix)

    if mime_type is None:
        raise ValueError(
            "Only PNG, JPG, and JPEG images are supported."
        )

    image_bytes = image_path.read_bytes()

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    return f"data:{mime_type};base64,{encoded_image}"


async def analyze_image(
    image_path: Path,
) -> list[VisualObservation]:
    """
    Analyze an image using the configured vision model.

    The vision model produces observations only.
    It does not calculate the flight assessment score.
    """

    image_data_url = _image_to_data_url(image_path)

    client = AsyncGroq(
        api_key=settings.groq_api_key,
    )

    response = await client.chat.completions.create(
        model=settings.groq_vision_model,
        messages=[
            {
                "role": "system",
                "content": VISION_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Inspect this aviation image. "
                            "Return ONLY the required JSON object. "
                            "If nothing meaningful can be observed, "
                            'return {"observations": []}.'
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data_url,
                        },
                    },
                ],
            },
        ],
        temperature=0,
        reasoning_effort="none",
        response_format={
            "type": "json_object",
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "Groq returned an empty vision response."
        )

    payload = json.loads(content)

    observations = payload.get("observations", [])

    if not isinstance(observations, list):
        raise ValueError(
            "Vision model returned an invalid observations structure."
        )

    results = []

    for observation in observations:
        results.append(
            VisualObservation(
                category=str(observation["category"]),
                finding=str(observation["finding"]),
                confidence=float(observation["confidence"]),
                source=image_path.name,
            )
        )

    return results