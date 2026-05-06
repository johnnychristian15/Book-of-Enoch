#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================
  Book of Enoch — JSON Editor
  Edits chapters.json and history.json
  Run:  python3 book_editor.py
================================================
"""

import json
import os
import sys
import shutil
from datetime import datetime

# ── File paths ────────────────────────────────────────────────────────────────
# Edit these two paths to match where your files actually live.
CHAPTERS_FILE = "data/chapters.json"
HISTORY_FILE  = "data/history.json"

# ── Helpers ───────────────────────────────────────────────────────────────────

def clear():
    os.system("cls" if os.name == "nt" else "clear")

def pause():
    input("\n  Press Enter to continue...")

def backup(filepath):
    """Create a timestamped backup before any write."""
    if os.path.exists(filepath):
        ts  = datetime.now().strftime("%Y%m%d_%H%M%S")
        bak = filepath + f".bak_{ts}"
        shutil.copy2(filepath, bak)
        print(f"  ✅ Backup saved: {bak}")

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"  ❌ File not found: {filepath}")
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filepath, data):
    backup(filepath)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ Saved: {filepath}")

def divider(char="─", width=54):
    print("  " + char * width)

def header(title):
    clear()
    divider("═")
    print(f"  📖  {title}")
    divider("═")
    print()

def multiline_input(prompt):
    """
    Let the user type (or paste) multiple lines.
    Type END on its own line to finish.
    Works even when pasting Gujarati text with line breaks.
    """
    print(f"  {prompt}")
    print("  (Type or paste your text. When done, type END on a new line and press Enter)\n")
    lines = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip() == "END":
            break
        lines.append(line)
    return "\n".join(lines).strip()

# ── Gujarati numeral helpers ──────────────────────────────────────────────────

GU_DIGITS = "૦૧૨૩૪૫૬૭૮૯"

def to_gujarati_numeral(n: int) -> str:
    result = ""
    for ch in str(n):
        result += GU_DIGITS[int(ch)]
    return result

def parse_verse_number(verse_text: str):
    """
    Return the integer verse number from the start of a verse string,
    supporting both ASCII (1.) and Gujarati (૧.) numerals.
    Returns None if unparseable.
    """
    part = verse_text.split(".")[0].strip()
    # Try ASCII
    if part.isdigit():
        return int(part)
    # Try Gujarati numerals
    ascii_part = ""
    for ch in part:
        idx = GU_DIGITS.find(ch)
        if idx >= 0:
            ascii_part += str(idx)
        else:
            return None
    return int(ascii_part) if ascii_part else None

def normalize_verse(raw: str, verse_num: int) -> str:
    """
    Ensure a verse starts with the correct Gujarati numeral prefix.
    If the user typed "૧. text" or "1. text" or just "text", we normalise it.
    """
    gu_num = to_gujarati_numeral(verse_num)
    # Strip any leading number the user may have included
    stripped = raw.strip()
    # Remove leading Gujarati or ASCII number + dot
    for prefix_style in [f"{gu_num}.", f"{verse_num}."]:
        if stripped.startswith(prefix_style):
            stripped = stripped[len(prefix_style):].strip()
            break
    return f"{gu_num}. {stripped}"

# ═════════════════════════════════════════════════════════════════════════════
#  HISTORY EDITOR
# ═════════════════════════════════════════════════════════════════════════════

def edit_history():
    while True:
        header("HISTORY EDITOR  —  history.json")
        data = load_json(HISTORY_FILE)
        if data is None:
            pause()
            return

        current = data.get("content", "")
        preview = current[:200].replace("\n", " ") + ("…" if len(current) > 200 else "")
        print(f"  Current content preview:\n  {preview}\n")
        divider()
        print("  1.  Replace entire history content")
        print("  2.  Append text to end of history")
        print("  3.  View full current content")
        print("  0.  Back to main menu")
        divider()
        choice = input("  Choose: ").strip()

        if choice == "1":
            new_text = multiline_input("Enter the NEW history content (replaces everything):")
            if not new_text:
                print("  ⚠️  Nothing entered. Cancelled.")
                pause()
                continue
            confirm = input(f"\n  Replace all history with {len(new_text)} characters? (yes/no): ").strip().lower()
            if confirm == "yes":
                data["content"] = new_text
                save_json(HISTORY_FILE, data)
            else:
                print("  Cancelled.")
            pause()

        elif choice == "2":
            add_text = multiline_input("Enter text to APPEND to history:")
            if not add_text:
                print("  ⚠️  Nothing entered. Cancelled.")
                pause()
                continue
            separator = "\n\n" if current else ""
            data["content"] = current + separator + add_text
            save_json(HISTORY_FILE, data)
            pause()

        elif choice == "3":
            header("FULL HISTORY CONTENT")
            print(data.get("content", "(empty)"))
            pause()

        elif choice == "0":
            return

# ═════════════════════════════════════════════════════════════════════════════
#  CHAPTERS EDITOR
# ═════════════════════════════════════════════════════════════════════════════

def list_chapters(chapters):
    divider()
    print(f"  {'#':<6} {'N':<6} Title")
    divider()
    for i, ch in enumerate(chapters):
        print(f"  {i+1:<6} {ch['n']:<6} {ch['title']}")
    divider()

def add_new_chapter(data):
    header("ADD NEW CHAPTER")
    chapters = data["chapters"]

    # Suggest next chapter number
    next_n = max((ch["n"] for ch in chapters), default=0) + 1
    print(f"  Next chapter number will be: {next_n}")
    override = input(f"  Press Enter to use {next_n}, or type a different number: ").strip()
    ch_num = int(override) if override.isdigit() else next_n

    # Check for duplicate
    if any(ch["n"] == ch_num for ch in chapters):
        print(f"  ⚠️  Chapter {ch_num} already exists. Use 'Edit chapter' instead.")
        pause()
        return

    title = input("  Chapter title (Gujarati): ").strip()
    if not title:
        print("  ⚠️  Title cannot be empty. Cancelled.")
        pause()
        return

    print(f"\n  Now enter the verses for Chapter {ch_num}.")
    print("  Format: just the verse text — no need to add the number prefix.")
    print("  The script will add ૧. ૨. ૩. automatically.\n")

    verses = []
    verse_num = 1
    while True:
        raw = input(f"  Verse {to_gujarati_numeral(verse_num)} (or press Enter to finish): ").strip()
        if not raw:
            if verse_num == 1:
                print("  ⚠️  At least one verse is required.")
                continue
            break
        verses.append(normalize_verse(raw, verse_num))
        verse_num += 1

    new_chapter = {"n": ch_num, "title": title, "verses": verses}

    # Insert in correct position by chapter number
    chapters.append(new_chapter)
    chapters.sort(key=lambda c: c["n"])
    data["chapters"] = chapters

    print(f"\n  ✅ Chapter {ch_num} ready with {len(verses)} verse(s).")
    confirm = input("  Save to chapters.json? (yes/no): ").strip().lower()
    if confirm == "yes":
        save_json(CHAPTERS_FILE, data)
    else:
        print("  Cancelled — nothing saved.")
    pause()

def edit_existing_chapter(data):
    header("EDIT EXISTING CHAPTER")
    chapters = data["chapters"]
    list_chapters(chapters)

    raw = input("  Enter chapter NUMBER (the n value) to edit: ").strip()
    if not raw.isdigit():
        print("  Invalid input.")
        pause()
        return

    ch_num = int(raw)
    match  = next((ch for ch in chapters if ch["n"] == ch_num), None)
    if not match:
        print(f"  ⚠️  Chapter {ch_num} not found.")
        pause()
        return

    while True:
        header(f"EDITING  Chapter {match['n']} — {match['title']}")
        print("  1.  Edit chapter title")
        print("  2.  Add verse(s) to end")
        print("  3.  Replace a specific verse")
        print("  4.  Delete a specific verse")
        print("  5.  View all verses")
        print("  0.  Back")
        divider()
        sub = input("  Choose: ").strip()

        if sub == "1":
            new_title = input(f"  New title (current: {match['title']}): ").strip()
            if new_title:
                match["title"] = new_title
                save_json(CHAPTERS_FILE, data)
            else:
                print("  Cancelled.")
            pause()

        elif sub == "2":
            next_v = len(match["verses"]) + 1
            print(f"  Starting from verse {to_gujarati_numeral(next_v)}.")
            while True:
                raw_v = input(f"  Verse {to_gujarati_numeral(next_v)} text (Enter to stop): ").strip()
                if not raw_v:
                    break
                match["verses"].append(normalize_verse(raw_v, next_v))
                next_v += 1
            save_json(CHAPTERS_FILE, data)
            pause()

        elif sub == "3":
            print("  Current verses:")
            for v in match["verses"]:
                print(f"    {v[:100]}")
            v_num = input("  Which verse number to replace? (e.g. 3): ").strip()
            if not v_num.isdigit():
                pause()
                continue
            v_idx = int(v_num) - 1
            if v_idx < 0 or v_idx >= len(match["verses"]):
                print("  ⚠️  Verse not found.")
                pause()
                continue
            print(f"  Current: {match['verses'][v_idx]}")
            new_v = input("  New text (no need to add number): ").strip()
            if new_v:
                match["verses"][v_idx] = normalize_verse(new_v, int(v_num))
                save_json(CHAPTERS_FILE, data)
            else:
                print("  Cancelled.")
            pause()

        elif sub == "4":
            print("  Current verses:")
            for v in match["verses"]:
                print(f"    {v[:100]}")
            v_num = input("  Which verse number to DELETE? ").strip()
            if not v_num.isdigit():
                pause()
                continue
            v_idx = int(v_num) - 1
            if v_idx < 0 or v_idx >= len(match["verses"]):
                print("  ⚠️  Verse not found.")
                pause()
                continue
            print(f"  About to delete: {match['verses'][v_idx][:80]}")
            confirm = input("  Confirm delete? (yes/no): ").strip().lower()
            if confirm == "yes":
                match["verses"].pop(v_idx)
                # Re-number remaining verses
                renumbered = []
                for i, v in enumerate(match["verses"], start=1):
                    text = v.split(".", 1)[1].strip() if "." in v else v
                    renumbered.append(normalize_verse(text, i))
                match["verses"] = renumbered
                save_json(CHAPTERS_FILE, data)
            else:
                print("  Cancelled.")
            pause()

        elif sub == "5":
            header(f"Chapter {match['n']} — {match['title']}")
            for v in match["verses"]:
                print(f"  {v}\n")
            pause()

        elif sub == "0":
            return

def delete_chapter(data):
    header("DELETE CHAPTER")
    chapters = data["chapters"]
    list_chapters(chapters)

    raw = input("  Enter chapter NUMBER (n) to delete: ").strip()
    if not raw.isdigit():
        pause()
        return

    ch_num = int(raw)
    match  = next((ch for ch in chapters if ch["n"] == ch_num), None)
    if not match:
        print(f"  ⚠️  Chapter {ch_num} not found.")
        pause()
        return

    print(f"\n  About to DELETE Chapter {ch_num} — {match['title']}")
    print(f"  This chapter has {len(match['verses'])} verse(s).")
    confirm = input("  Type DELETE to confirm: ").strip()
    if confirm == "DELETE":
        data["chapters"] = [ch for ch in chapters if ch["n"] != ch_num]
        save_json(CHAPTERS_FILE, data)
    else:
        print("  Cancelled.")
    pause()

def edit_chapters():
    while True:
        header("CHAPTERS EDITOR  —  chapters.json")
        data = load_json(CHAPTERS_FILE)
        if data is None:
            pause()
            return

        chapters = data.get("chapters", [])
        print(f"  Total chapters loaded: {len(chapters)}")
        if chapters:
            first = chapters[0]
            last  = chapters[-1]
            print(f"  Range: Chapter {first['n']} → Chapter {last['n']}\n")

        divider()
        print("  1.  Add a new chapter")
        print("  2.  Edit an existing chapter")
        print("  3.  Delete a chapter")
        print("  4.  List all chapters")
        print("  0.  Back to main menu")
        divider()
        choice = input("  Choose: ").strip()

        if choice == "1":
            add_new_chapter(data)
        elif choice == "2":
            edit_existing_chapter(data)
        elif choice == "3":
            delete_chapter(data)
        elif choice == "4":
            header("ALL CHAPTERS")
            list_chapters(data.get("chapters", []))
            pause()
        elif choice == "0":
            return

# ═════════════════════════════════════════════════════════════════════════════
#  MAIN MENU
# ═════════════════════════════════════════════════════════════════════════════

def main():
    # Verify Python version supports UTF-8 properly
    if sys.version_info < (3, 6):
        print("Python 3.6+ required.")
        sys.exit(1)

    # Force UTF-8 stdout (important on Windows)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    while True:
        header("BOOK OF ENOCH  —  JSON Editor")
        print("  Files:")
        print(f"    chapters : {CHAPTERS_FILE}")
        print(f"    history  : {HISTORY_FILE}")
        print()
        print("  What would you like to edit?")
        divider()
        print("  1.  📚  Chapters  (add / edit / delete chapters & verses)")
        print("  2.  📜  History   (replace or append history content)")
        print("  0.  Exit")
        divider()
        choice = input("  Choose: ").strip()

        if choice == "1":
            edit_chapters()
        elif choice == "2":
            edit_history()
        elif choice == "0":
            print("\n  Goodbye!\n")
            break

if __name__ == "__main__":
    main()
