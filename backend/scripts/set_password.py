"""Set a known password on a seeded account, so you can log in during a demo.

The seed scripts wrote bcrypt hashes of generated passwords, so none of the
10,000 seeded users has a password you know. Run this to set one:

    cd backend
    python scripts/set_password.py trainee1@example.com

It prompts for the new password (never pass it on the command line — it would
land in your shell history). Use --list to see a few accounts of each role.
"""

import argparse
import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.users import User  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Set a password on a seeded account")
    parser.add_argument("email", nargs="?", help="Email of the account to update")
    parser.add_argument("--list", action="store_true", help="Show sample accounts per role")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.list or not args.email:
            for role in ("trainee", "employer", "government"):
                rows = db.query(User).filter(User.role == role).limit(3).all()
                print("\n{}:".format(role))
                for user in rows:
                    print("  id={:<6} {}".format(user.id, user.email))
            if not args.email:
                print("\nRun again with one of these emails to set its password.")
                return 0

        user = db.query(User).filter(User.email == args.email).first()
        if user is None:
            print("No user with email {}".format(args.email))
            return 1

        password = getpass.getpass("New password for {}: ".format(user.email))
        confirm = getpass.getpass("Confirm: ")
        if password != confirm:
            print("Passwords didn't match — nothing changed.")
            return 1
        if len(password) < 8:
            print("Use at least 8 characters — nothing changed.")
            return 1

        user.password_hash = hash_password(password)
        db.commit()
        print("Updated. You can now log in as {} (role: {}).".format(user.email, user.role))
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
