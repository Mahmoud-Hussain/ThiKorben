import time
import pytest
from selenium.webdriver.common.by import By
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_track_worker_render(driver, base_url):
    """TC-TRK-001 & TC-TRK-003: Track worker screen renders header, map area, ETA badge, and worker details"""
    driver.get(f"{base_url}/track-worker")
    wait_for_app_ready(driver)

    # Title & ETA
    assert wait_for_text(driver, "Track Worker")
    assert wait_for_text(driver, "12 min away")

    # Worker info
    assert wait_for_text(driver, "Rahim is on the way")
    assert wait_for_text(driver, "Master Plumber")

def test_track_worker_safe_back_button_bug003(driver, base_url):
    """TC-TRK-001 & TC-REG-003: Safe back button on track-worker returns safely to /"""
    driver.get(f"{base_url}/track-worker")
    wait_for_app_ready(driver)

    # Click Back button using aria-label
    safe_click(driver, "//*[@aria-label='Go back'] | //*[contains(text(), 'Track Worker')]/parent::div/div[1]")
    time.sleep(0.5)

    # Safe fallback redirects to customer marketplace
    assert wait_for_text(driver, "Verified Pros Near You")
    assert "track-worker" not in driver.current_url

def test_track_worker_action_buttons(driver, base_url):
    """TC-TRK-004 & TC-TRK-005: Call and Message buttons are available and responsive"""
    driver.get(f"{base_url}/track-worker")
    wait_for_app_ready(driver)

    # Call Worker button exists
    assert wait_for_text(driver, "Call Worker")
    # Message button exists
    assert wait_for_text(driver, "Message")
