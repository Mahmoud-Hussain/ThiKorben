import pytest
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_welcome_page_render(driver, base_url):
    """TC-WEL-001: Welcome screen renders title, subtitle, and role buttons"""
    driver.get(f"{base_url}/welcome")
    wait_for_app_ready(driver)

    # Verify branding title
    assert wait_for_text(driver, "ThiKorben")

    # Verify subtitle / tagline
    assert wait_for_text(driver, "Instant Home Services")

    # Verify role cards are visible
    assert wait_for_text(driver, "I Need a Service")
    assert wait_for_text(driver, "I Am a Worker")

def test_welcome_language_toggle(driver, base_url):
    """TC-WEL-004: Language toggle updates English to Bangla and back"""
    driver.get(f"{base_url}/welcome")
    wait_for_app_ready(driver)

    # Switch to Bangla (button is 'বাং')
    safe_click(driver, "//*[text()='বাং']")
    assert wait_for_text(driver, "ঠিককরবেন")

    # Switch back to English (button is 'EN')
    safe_click(driver, "//*[text()='EN']")
    assert wait_for_text(driver, "ThiKorben")

def test_welcome_navigate_to_customer(driver, base_url):
    """TC-WEL-002 / TC-REG-001: Clicking customer role navigates to /"""
    driver.get(f"{base_url}/welcome")
    wait_for_app_ready(driver)

    # Click Customer card
    safe_click(driver, "//*[contains(text(), 'I Need a Service') or contains(text(), 'Enter as Customer')]")

    # Verify navigated to Customer Marketplace
    assert wait_for_text(driver, "Verified Pros Near You")
    assert not driver.current_url.endswith("/welcome")

def test_welcome_navigate_to_worker(driver, base_url):
    """TC-WEL-003: Clicking worker role navigates to worker dashboard"""
    driver.get(f"{base_url}/welcome")
    wait_for_app_ready(driver)

    # Click Worker card
    safe_click(driver, "//*[contains(text(), 'I Am a Worker') or contains(text(), 'Enter as Worker')]")

    # Verify navigated to Worker Dashboard (Rahim Uddin or AVAILABLE FOR JOBS)
    assert wait_for_xpath(driver, "//*[contains(text(), 'AVAILABLE FOR JOBS') or contains(text(), 'Rahim Uddin')]")
    assert "worker-dashboard" in driver.current_url
