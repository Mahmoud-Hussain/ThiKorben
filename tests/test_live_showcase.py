import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_full_live_showcase_journey(driver, base_url):
    """
    Live Interactive Demonstration:
    Walks through all features visibly on screen with highlight indicators:
    1. Welcome Screen & Bangla Language Switch
    2. Enter Customer Mode
    3. Live Search & Pro Filtering
    4. Bento Category Toggling
    5. Pro Card Selection -> Worker Profile (Rahim Uddin)
    6. Review list inspection & Booking CTA
    7. Track Worker screen & ETA badge
    8. Switch to Worker Dashboard via BottomNavBar
    9. Online/Offline toggle & Urgent Job Banner reaction
    10. View & Accept incoming emergency job -> Job Details
    11. Job lifecycle step advancement
    12. Return to Customer Marketplace
    """
    print("\n[LIVE DEMO] Step 1: Opening Welcome Screen...")
    driver.get(f"{base_url}/welcome")
    wait_for_app_ready(driver)
    time.sleep(1.0)
    assert wait_for_text(driver, "ThiKorben")

    print("[LIVE DEMO] Step 2: Toggling Language to Bangla and back to English...")
    safe_click(driver, "//*[text()='বাং']")
    time.sleep(1.0)
    assert wait_for_text(driver, "ঠিককরবেন")

    safe_click(driver, "//*[text()='EN']")
    time.sleep(1.0)
    assert wait_for_text(driver, "ThiKorben")

    print("[LIVE DEMO] Step 3: Entering as Customer...")
    safe_click(driver, "//*[contains(text(), 'I Need a Service') or contains(text(), 'Enter as Customer')]")
    wait_for_app_ready(driver)
    time.sleep(1.2)
    assert wait_for_text(driver, "Verified Pros Near You")

    print("[LIVE DEMO] Step 4: Testing Search Filter for 'Kamal'...")
    search_input = wait_for_xpath(driver, "//input[@placeholder='Search plumber, electrician, repairs...']")
    driver.execute_script("arguments[0].style.outline = '3px solid #15157d';", search_input)
    time.sleep(0.5)
    search_input.send_keys("Kamal")
    time.sleep(1.5)
    assert wait_for_text(driver, "Kamal Hossain")

    print("[LIVE DEMO] Step 5: Clearing Search Query...")
    search_input.send_keys(Keys.CONTROL, "a")
    search_input.send_keys(Keys.BACKSPACE)
    time.sleep(1.2)
    assert wait_for_text(driver, "Rahim Uddin")

    print("[LIVE DEMO] Step 6: Filtering by Plumber Bento Category...")
    safe_click(driver, "//*[text()='Plumber']")
    time.sleep(1.5)
    assert wait_for_text(driver, "Rahim Uddin")

    # Reset filter
    safe_click(driver, "//*[text()='Show All']")
    time.sleep(1.0)

    print("[LIVE DEMO] Step 7: Navigating to Rahim Uddin's Worker Profile...")
    safe_click(driver, "//*[contains(text(), 'Rahim Uddin')]")
    wait_for_app_ready(driver)
    time.sleep(1.5)
    assert wait_for_text(driver, "Worker Profile")
    assert wait_for_text(driver, "Master Plumber & Sanitary Expert")

    print("[LIVE DEMO] Step 8: Triggering Booking Action...")
    safe_click(driver, "//*[contains(text(), 'Book Rahim Now')]")
    time.sleep(1.2)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    print("[LIVE DEMO] Step 9: Navigating to Live Worker Tracking Screen...")
    safe_click(driver, "//*[text()='Track' and preceding::*[text()='Job Flow']]")
    wait_for_app_ready(driver)
    time.sleep(1.8)
    assert wait_for_text(driver, "Track Worker")
    assert wait_for_text(driver, "12 min away")

    print("[LIVE DEMO] Step 10: Navigating to Worker Dashboard...")
    safe_click(driver, "//*[text()='Worker' and preceding::*[text()='Track']]")
    wait_for_app_ready(driver)
    time.sleep(1.5)
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_text(driver, "AVAILABLE FOR JOBS")

    print("[LIVE DEMO] Step 11: Toggling Worker Offline & Observing Urgent Banner Hide...")
    toggle_xpath = "//*[contains(text(), 'AVAILABLE FOR JOBS') or contains(text(), 'CURRENTLY OFFLINE')]/ancestor::div[2]/following-sibling::div[@tabindex='0']"
    safe_click(driver, toggle_xpath)
    time.sleep(1.2)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass
    assert wait_for_text(driver, "CURRENTLY OFFLINE")

    print("[LIVE DEMO] Step 12: Toggling Worker Back Online...")
    safe_click(driver, toggle_xpath)
    time.sleep(1.2)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass
    assert wait_for_text(driver, "AVAILABLE FOR JOBS")
    assert wait_for_text(driver, "NEW INCOMING JOB")

    print("[LIVE DEMO] Step 13: Opening Job Details from Incoming Emergency Job...")
    safe_click(driver, "//*[contains(text(), 'View & Accept')]")
    wait_for_app_ready(driver)
    time.sleep(1.5)
    assert wait_for_text(driver, "Job Details")

    print("[LIVE DEMO] Step 14: Advancing Lifecycle Step to 'Start Working'...")
    safe_click(driver, "//*[contains(text(), 'Mark Arrived at Location')]/ancestor::div[@tabindex='0' or @role='button'][1]")
    time.sleep(1.2)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass
    assert wait_for_text(driver, "Start Working")

    print("[LIVE DEMO] Step 15: Returning to Customer Home...")
    safe_click(driver, "//*[text()='Home' and following::*[text()='Pros']]")
    wait_for_app_ready(driver)
    time.sleep(2.0)
    assert wait_for_text(driver, "Verified Pros Near You")
    print("[LIVE DEMO] Complete Showcase Finished Successfully!\n")
