"""Populate a fresh database with sample categories, locations, parts, and a
demo project so the UI has something to show immediately.

Run with: python -m app.seed
"""
from app import models
from app.database import Base, SessionLocal, engine


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Part).count() > 0:
            print("Database already has parts; skipping seed.")
            return

        cabinet = models.Location(name="Parts Cabinet A")
        db.add(cabinet)
        db.flush()
        drawer1 = models.Location(name="Drawer 1 - Resistors", parent_id=cabinet.id)
        drawer2 = models.Location(name="Drawer 2 - ICs", parent_id=cabinet.id)
        drawer3 = models.Location(name="Drawer 3 - Passives", parent_id=cabinet.id)
        db.add_all([drawer1, drawer2, drawer3])
        db.flush()

        cat_names = ["Resistor", "Capacitor", "IC", "Transistor", "Microcontroller Board", "Connector"]
        cats = {name: models.Category(name=name) for name in cat_names}
        db.add_all(cats.values())
        db.flush()

        parts = [
            models.Part(
                name="10k Ohm Resistor", category_id=cats["Resistor"].id, location_id=drawer1.id,
                value="10k", package="0805", quantity=480, quantity_threshold=100, unit="pcs",
                manufacturer="Yageo", mpn="RC0805FR-0710KL",
            ),
            models.Part(
                name="1k Ohm Resistor", category_id=cats["Resistor"].id, location_id=drawer1.id,
                value="1k", package="0805", quantity=42, quantity_threshold=100, unit="pcs",
                manufacturer="Yageo", mpn="RC0805FR-071KL",
            ),
            models.Part(
                name="100nF Ceramic Capacitor", category_id=cats["Capacitor"].id, location_id=drawer3.id,
                value="100nF", package="0603", quantity=310, quantity_threshold=100, unit="pcs",
            ),
            models.Part(
                name="NE555 Timer IC", category_id=cats["IC"].id, location_id=drawer2.id,
                package="DIP-8", quantity=6, quantity_threshold=5, unit="pcs",
                manufacturer="Texas Instruments", mpn="NE555P",
                datasheet_url="https://www.ti.com/lit/ds/symlink/ne555.pdf",
            ),
            models.Part(
                name="2N2222 NPN Transistor", category_id=cats["Transistor"].id, location_id=drawer2.id,
                package="TO-92", quantity=25, quantity_threshold=10, unit="pcs",
            ),
            models.Part(
                name="ESP32-WROOM-32 Dev Board", category_id=cats["Microcontroller Board"].id,
                location_id=cabinet.id, quantity=3, quantity_threshold=2, unit="pcs",
                manufacturer="Espressif",
            ),
            models.Part(
                name="JST-PH 2-pin Connector", category_id=cats["Connector"].id, location_id=drawer3.id,
                quantity=15, quantity_threshold=20, unit="pcs",
            ),
        ]
        db.add_all(parts)
        db.flush()

        project = models.Project(name="LED Matrix Clock", description="Desk clock with a 555-based blink demo.", status="active")
        db.add(project)
        db.flush()
        db.add_all(
            [
                models.BOMItem(project_id=project.id, part_id=parts[3].id, quantity_required=2),  # NE555, have 6
                models.BOMItem(project_id=project.id, part_id=parts[4].id, quantity_required=4),  # 2N2222
                models.BOMItem(project_id=project.id, part_id=parts[6].id, quantity_required=25),  # connectors, short!
            ]
        )

        db.commit()
        print("Seeded database with sample data.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
