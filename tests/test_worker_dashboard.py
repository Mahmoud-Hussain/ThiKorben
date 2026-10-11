import time
import pytest
from selenium.webdriver.common.by import By
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_worker_dashboard_render(driver, base_url):
    """TC-WRK-001: Header, worker identity, and earnings overview render properly"""
    driver.get(f"{base_url}/worker-dashboard")
    wait_for_app_ready(driver)

    # Worker info
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_text(driver, "Plumbing Specialist")

    # Initial online badge
    assert wait_for_text(driver, "AVAILABLE FOR JOBS")

    # Stats cards
    assert wait_for_text(driver, "Today's Earnings")
    assert wait_for_text(driver, "Jobs Completed")

def test_worker_stats_title_bug004(driver, base_url):
    """TC-REG-004: Text strings do not contain literal unescaped HTML entities &apos;"""
    driver.get(f"{base_url}/worker-dashboard")
    wait_for_app_ready(driver)

    stats_header = wait_for_text(driver, "Today's Earnings")
    assert "&apos;" not in stats_header.text
    assert "&#39;" not in stats_header.text

def test_worker_online_toggle_and_urgent_banner_bug010(driver, base_url):
    """TC-WRK-002 & TC-REG-010: Urgent job banner only renders when worker is online"""
    driver.get(f"{base_url}/worker-dashboard")
    wait_for_app_ready(driver)

    # Initially online -> urgent banner visible
    assert wait_for_text(driver, "AVAILABLE FOR JOBS")
    assert wait_for_text(driver, "NEW INCOMING JOB")
    assert wait_for_text(driver, "Kitchen sink pipe leaking")

    # Locate toggle button in status card via following-sibling div
    toggle_xpath = "//*[contains(text(), 'AVAILABLE FOR JOBS') or contains(text(), 'CURRENTLY OFFLINE')]/ancestor::div[2]/following-sibling::div[@tabindex='0']"
    safe_click(driver, toggle_xpath)
    time.sleep(0.8)

    # Dismiss any browser alert triggered by Alert.alert on web
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    # Verify state toggled to OFFLINE
    assert wait_for_text(driver, "CURRENTLY OFFLINE")

    # Verify urgent banner is now hidden
    urgent_elems = driver.find_elements(By.XPATH, "//*[contains(text(), 'NEW INCOMING JOB')]")
    visible_urgents = [u for u in urgent_elems if u.is_displayed()]
    assert len(visible_urgents) == 0

    # Toggle back to Online
    safe_click(driver, toggle_xpath)
    time.sleep(0.8)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    # State restored to AVAILABLE and urgent banner returns
    assert wait_for_text(driver, "AVAILABLE FOR JOBS")
    assert wait_for_text(driver, "NEW INCOMING JOB")

def test_worker_switch_to_customer_mode(driver, base_url):
    """TC-WRK-001: Clicking Customer Mode button navigates back to /"""
    driver.get(f"{base_url}/worker-dashboard")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[contains(text(), 'Customer Mode')]")

    # Should be back at customer marketplace
    assert wait_for_text(driver, "Verified Pros Near You")
    assert not driver.current_url.endswith("/worker-dashboard")

def test_worker_navigate_to_job_details(driver, base_url):
    """TC-WRK-006: Clicking 'View & Accept' on incoming job navigates to job-details"""
    driver.get(f"{base_url}/worker-dashboard")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[contains(text(), 'View & Accept') or contains(text(), 'View Details')]")

    # Verify on Job Details screen
    assert wait_for_text(driver, "Job Details")
    assert "job-details" in driver.current_url
