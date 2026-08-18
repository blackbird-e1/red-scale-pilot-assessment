import asyncio
from pathlib import Path

from app.services.vision_service import analyze_image


async def main() -> None:
    image_path = Path("test_images/image001.png")

    if not image_path.exists():
        raise FileNotFoundError(
            f"Test image not found: {image_path}"
        )

    observations = await analyze_image(image_path)

    print("\nVisual observations:")
    print("-" * 60)

    if not observations:
        print("No observations returned.")
        return

    for observation in observations:
        print(f"Category:    {observation.category}")
        print(f"Finding:     {observation.finding}")
        print(f"Confidence:  {observation.confidence}")
        print(f"Source:      {observation.source}")
        print("-" * 60)


if __name__ == "__main__":
    asyncio.run(main())