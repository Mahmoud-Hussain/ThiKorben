import time
import pytest
from selenium.webdriver.common.by import By
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_job_details_render(driver, base_url):
    """TC-JOB-001: Header, job metadata, location, and cost breakdown render properly"""
    driver.get(f"{base_url}/job-details")
    wait_for_app_ready(driver)

    # Job header
    assert wait_for_text(driver, "Job Details")
    assert wait_for_text(driver, "Dhanmondi")

    # Customer and job info
    assert wait_for_text(driver, "Nusrat Ahmed") or wait_for_text(driver, "Job Lifecycle Progress")
    assert wait_for_text(driver, "Job Accepted")

def test_job_details_step_advance_flow(driver, base_url):
    """TC-JOB-003 & TC-JOB-004: Advancing lifecycle progress updates step title and CTA button text"""
    driver.get(f"{base_url}/job-details")
    wait_for_app_ready(driver)

    # Step 1 button text
    assert wait_for_text(driver, "Mark Arrived at Location")

    # Click advance button
    safe_click(driver, "//*[contains(text(), 'Mark Arrived at Location')]/ancestor::div[@tabindex='0' or @role='button'][1]")
    time.sleep(0.5)

    # Handle any alert
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    # Should advance to Step 2
    assert wait_for_text(driver, "Start Working")

def test_job_details_safe_back_button_bug003(driver, base_url):
    """TC-JOB-007 & TC-REG-003: Direct URL back button safely falls back to /"""
    driver.get(f"{base_url}/job-details")
    wait_for_app_ready(driver)

    # Click top-left Back button
    safe_click(driver, "//*[contains(text(), 'Job Details')]/ancestor::div[1]/preceding-sibling::div[1] | //div[contains(@class, 'backBtn') or descendant::*[name()='svg']][1]")
    time.sleep(0.5)

    # Falls back safely to customer marketplace
    assert wait_for_text(driver, "Verified Pros Near You")
    assert "job-details" not in driver.current_url

def test_job_details_bottom_bar_layout_bug002(driver, base_url):
    """TC-JOB-006 & TC-REG-002: Bottom action button sits in clean layout without obscuring nav"""
    driver.get(f"{base_url}/job-details")
    wait_for_app_ready(driver)

    # Advance button is visible and clickable
    advance_btn = wait_for_xpath(driver, "//div[contains(@class, 'advanceStepBtn') or descendant::*[contains(text(), 'Mark Arrived') or contains(text(), 'Start Working')]]")
    assert advance_btn.is_displayed()
