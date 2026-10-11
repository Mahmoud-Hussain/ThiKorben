import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_customer_dashboard_render(driver, base_url):
    """TC-CUST-001: Header, hero, and verified pros list render properly"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # App title in header
    assert wait_for_text(driver, "ThiKorben")
    # Section title
    assert wait_for_text(driver, "Verified Pros Near You")
    # Pro cards
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_text(driver, "Kamal Hossain")

def test_customer_language_toggle(driver, base_url):
    """TC-CUST-001: Language switcher toggles English and Bangla"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Click Bangla
    safe_click(driver, "//*[text()='বাংলা']")
    assert wait_for_text(driver, "ঠিককরবেন")

    # Click English
    safe_click(driver, "//*[text()='English']")
    assert wait_for_text(driver, "ThiKorben")

def test_customer_search_and_clear(driver, base_url):
    """TC-CUST-002 & TC-CUST-003: Search query filters pros and clear button resets"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Find search input
    search_input = wait_for_xpath(driver, "//input[@placeholder='Search plumber, electrician, repairs...']")
    search_input.send_keys("Kamal")
    time.sleep(0.5)

    # Verify Kamal is visible and Rahim is filtered out
    assert wait_for_text(driver, "Kamal Hossain")
    pros_with_rahim = driver.find_elements(By.XPATH, "//*[contains(text(), 'Rahim Uddin')]")
    visible_rahims = [p for p in pros_with_rahim if p.is_displayed()]
    assert len(visible_rahims) == 0

    # Clear input using backspace keystrokes
    search_input.send_keys(Keys.CONTROL, "a")
    search_input.send_keys(Keys.BACKSPACE)
    time.sleep(0.5)

    # Both should be present again
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_text(driver, "Kamal Hossain")

def test_customer_search_empty_state_bug020(driver, base_url):
    """TC-CUST-004 & TC-REG-020: Search with no matches displays empty state message"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    search_input = wait_for_xpath(driver, "//input[@placeholder='Search plumber, electrician, repairs...']")
    search_input.send_keys("NonExistentWorker9999")
    time.sleep(0.5)

    # Verify BUG-020 empty text is shown
    empty_elem = wait_for_text(driver, "No workers found. Try a different search.")
    assert empty_elem.is_displayed()

def test_customer_bento_category_filter(driver, base_url):
    """TC-CUST-005: Bento grid category buttons filter pros list"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Click Plumber bento card
    safe_click(driver, "//*[text()='Plumber']")
    time.sleep(0.5)

    # Should show Rahim (Plumber) but not Kamal (Carpenter)
    assert wait_for_text(driver, "Rahim Uddin")
    carpenter_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Expert Carpenter')]")
    visible_carpenters = [c for c in carpenter_elements if c.is_displayed()]
    assert len(visible_carpenters) == 0

    # Click 'Show All' to reset filter
    safe_click(driver, "//*[text()='Show All']")
    time.sleep(0.5)

    # Both should be back
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_text(driver, "Kamal Hossain")

def test_customer_emergency_modal_flow(driver, base_url):
    """TC-CUST-008 & TC-CUST-011: Emergency modal opens and can be closed"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Click Emergency Request button on customer role card
    safe_click(driver, "//*[contains(text(), 'Emergency Request')]")

    # Verify modal header appears
    modal_title = wait_for_text(driver, "Request Instant Service")
    assert modal_title.is_displayed()

    # Verify emergency service options exist
    assert wait_for_text(driver, "Plumbing Leak Fix")
    assert wait_for_text(driver, "Short Circuit & Power Spark")

    # Close modal via close button
    safe_click(driver, "//div[contains(@style, 'modalCloseBtn') or descendant::*[contains(@class, 'Ionicons') or name()='svg']]//ancestor::div[@role='button' or @tabindex='0'][1] | //*[contains(text(), 'Request Instant Service')]/ancestor::div[1]/following-sibling::*")
    time.sleep(0.5)

def test_customer_navigate_to_worker_profile_bug005(driver, base_url):
    """TC-CUST-012 & TC-REG-005: Clicking pro card navigates to worker-profile with workerId"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Click on Rahim Uddin's pro card
    safe_click(driver, "//*[contains(text(), 'Rahim Uddin')]")

    # Verify navigated to /worker-profile
    assert wait_for_text(driver, "Worker Profile")
    assert wait_for_text(driver, "Master Plumber & Sanitary Expert")
    assert "worker-profile" in driver.current_url
    assert "workerId=" in driver.current_url

def test_customer_dashboard_redirect_bug006(driver, base_url):
    """TC-CUST-014 & TC-REG-006: Direct access to /customer-dashboard redirects to /"""
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)

    # Should redirect to root and show customer dashboard
    assert wait_for_text(driver, "Verified Pros Near You")
    assert "customer-dashboard" not in driver.current_url
