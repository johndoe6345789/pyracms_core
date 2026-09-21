"""Password hashing in the exact format the C++ backend stores.

Mirrors AuthService::hashPassword / verifyPassword: "salt_hex:hash_hex",
PBKDF2-HMAC-SHA256, 16-byte salt, 32-byte hash, 100000 iterations.
"""
import hashlib
import hmac
import os

SALT_LEN = 16
HASH_LEN = 32
ITERATIONS = 100000
MIN_LEN = 8
MAX_LEN = 256  # AuthService::kMaxPasswordLen, counted in bytes


def _derive(password, salt):
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, ITERATIONS, HASH_LEN)


def hash_password(password, salt=None):
    salt = os.urandom(SALT_LEN) if salt is None else salt
    return f"{salt.hex()}:{_derive(password, salt).hex()}"


def verify_password(password, stored):
    salt_hex, sep, hash_hex = stored.partition(":")
    try:
        salt = bytes.fromhex(salt_hex)
    except ValueError:
        return False
    if not sep or len(salt) != SALT_LEN:
        return False
    return hmac.compare_digest(_derive(password, salt).hex(), hash_hex)


def length_problem(password):
    """Why the backend would reject this password, or None if it is fine."""
    if not MIN_LEN <= len(password.encode()) <= MAX_LEN:
        return f"Password must be {MIN_LEN}-{MAX_LEN} characters"
    return None
