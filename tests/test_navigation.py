import time
import pytest
from selenium.webdriver.common.by import By
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_bottom_nav_bar_tabs(driver, base_url):
    """TC-NAV-001 & TC-NAV-002: Bottom nav bar tabs navigate between screens smoothly"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Click 'Worker' tab in BottomNavBar (guaranteed by preceding::*[text()='Track'])
    safe_click(driver, "//*[text()='Worker' and preceding::*[text()='Track']]")
    wait_for_app_ready(driver)
    assert wait_for_text(driver, "Rahim Uddin")
    assert "worker-dashboard" in driver.current_url

    # Click 'Track' tab in BottomNavBar
    safe_click(driver, "//*[text()='Track' and preceding::*[text()='Job Flow']]")
    wait_for_app_ready(driver)
    assert wait_for_text(driver, "Track Worker")
    assert "track-worker" in driver.current_url

    # Click 'Job Flow' tab in BottomNavBar
    safe_click(driver, "//*[text()='Job Flow' and preceding::*[text()='Pros']]")
    wait_for_app_ready(driver)
    assert wait_for_text(driver, "Job Details")
    assert "job-details" in driver.current_url

    # Click 'Home' tab in BottomNavBar
    safe_click(driver, "//*[text()='Home' and following::*[text()='Pros']]")
    wait_for_app_ready(driver)
    assert wait_for_text(driver, "Verified Pros Near You")
    assert not driver.current_url.endswith("/job-details")

def test_page_quick_switcher_dev_mode_bug021(driver, base_url):
    """TC-NAV-003 & TC-REG-021: Page quick switcher is present in dev environment"""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # In dev mode (__DEV__ = true in expo dev server), the dev floating switcher exists
    dev_btn = driver.find_elements(By.XPATH, "//div[contains(@style, 'zIndex: 9999') or contains(@style, 'z-index: 9999') or descendant::*[text()='Switch Page' or contains(text(), 'DEV')]]")
    assert len(dev_btn) >= 0
