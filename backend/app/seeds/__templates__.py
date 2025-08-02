import importlib
import pkgutil
import traceback

# Templates-Ordner als Unterpaket
from . import templates


def main():
    print("📦 Starting to seed all templates...")
    for _, module_name, is_pkg in pkgutil.iter_modules(templates.__path__):
        if is_pkg:
            continue
        try:
            module = importlib.import_module(f".{module_name}", package=__package__ + ".templates")
            if hasattr(module, "seed"):
                print(f"🚀 Seeding {module_name}...")
                module.seed()
            else:
                print(f"⚠️  No seed() function found in {module_name}")
        except Exception as e:
            print(f"❌ Error while seeding {module_name}: {e}")
            traceback.print_exc()


if __name__ == "__main__":
    main()
