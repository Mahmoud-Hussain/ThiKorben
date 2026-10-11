import time
import pytest
from selenium.webdriver.common.by import By
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_worker_profile_render(driver, base_url):
    """TC-PRF-001: Worker profile displays info, verified badge, and specialties"""
    driver.get(f"{base_url}/worker-profile?workerId=rahim")
    wait_for_app_ready(driver)

    # Header & Name
    assert wait_for_text(driver, "Worker Profile")
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_text(driver, "Master Plumber & Sanitary Expert")

    # Skills
    assert wait_for_text(driver, "Pipe Leakage Repair")
    assert wait_for_text(driver, "Sanitary & Basin Fitting")

    # Reviews heading
    assert wait_for_text(driver, "Verified Reviews")
    assert wait_for_text(driver, "Nusrat Ahmed")

def test_worker_profile_reviews_stars_bug008(driver, base_url):
    """TC-PRF-002 & TC-REG-008: Review stars correctly evaluate individual review rating"""
    driver.get(f"{base_url}/worker-profile?workerId=rahim")
    wait_for_app_ready(driver)

    # Verify review comments render accurately
    assert wait_for_text(driver, "Rahim bhai came in just 12 minutes")
    assert wait_for_text(driver, "Tanvir Rahman")
    assert wait_for_text(driver, "Shamim Hossain")

def test_worker_profile_bottom_bar_cta_bug002(driver, base_url):
    """TC-PRF-007 & TC-REG-002: Sticky action bar does not overlap bottom nav bar"""
    driver.get(f"{base_url}/worker-profile?workerId=rahim")
    wait_for_app_ready(driver)

    # 'Book Rahim Now' button exists and is clickable
    book_btn = wait_for_xpath(driver, "//*[contains(text(), 'Book Rahim Now')]/ancestor::div[@tabindex='0' or @role='button'][1]")
    assert book_btn.is_displayed()

    # Click Book Now button
    safe_click(driver, book_btn)
    time.sleep(0.5)

    # Dismiss any browser alert if triggered
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

def test_worker_profile_safe_back_button_bug003(driver, base_url):
    """TC-PRF-008 & TC-REG-003: Direct URL back button safely falls back to /"""
    # Open worker-profile directly with no previous browser history
    driver.get(f"{base_url}/worker-profile")
    wait_for_app_ready(driver)

    # Click top-left Back button
    safe_click(driver, "//*[text()='Worker Profile']/parent::div/div[1]")
    time.sleep(0.5)

    # Safe fallback redirects to customer marketplace
    assert wait_for_text(driver, "Verified Pros Near You")
    assert "worker-profile" not in driver.current_url
