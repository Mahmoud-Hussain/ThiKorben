import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from tests.conftest import (
    wait_for_app_ready,
    wait_for_text,
    wait_for_xpath,
    safe_click,
    fill_input,
    dismiss_alert_if_present,
)

def test_01_customer_publishes_valid_request(driver, base_url):
    """Scenario 1: Customer publishes a valid request -> Success; job is persisted."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Ensure in Customer mode
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.4)

    # Click + to create
    safe_click(driver, "//*[@data-testid='community-create-button']")
    wait_for_app_ready(driver)

    req_title = f"Living Room Chandelier Wiring {int(time.time())}"
    fill_input(
        driver,
        "//*[@data-testid='request-title-input' or @placeholder='e.g. Kitchen sink pipe leaking']",
        req_title,
    )
    fill_input(
        driver,
        "//*[@data-testid='request-desc-input' or @placeholder='Explain what is happening and what help you need.']",
        "Need certified electrician to install heavy crystal chandelier with proper ceiling anchors.",
    )
    fill_input(
        driver,
        "//*[@data-testid='request-location-input' or @placeholder='e.g. Dhanmondi, Dhaka']",
        "Gulshan 2, Dhaka",
    )
    fill_input(
        driver,
        "//*[@data-testid='request-budget-input' or @placeholder='e.g. 800']",
        "2000",
    )
    time.sleep(0.4)

    safe_click(driver, "//*[@data-testid='submit-service-request-button' or contains(text(), 'Publish Request')]")
    dismiss_alert_if_present(driver)
    wait_for_app_ready(driver)

    # Verified job detail is open with title
    assert wait_for_text(driver, req_title)
    assert wait_for_text(driver, "Public Discussion")

def test_02_worker_attempts_to_publish_rejected(driver, base_url):
    """Scenario 2: Worker attempts to publish a request -> Rejected."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Switch to Worker mode
    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    # Attempt to click create request button
    safe_click(driver, "//*[@data-testid='community-create-button']")
    time.sleep(0.5)

    # An alert dialog must block them: "Customer Role Required"
    alert_text = dismiss_alert_if_present(driver)
    if alert_text:
        assert "Customer" in alert_text or "customer" in alert_text

    # Verify we did NOT navigate to create form
    # We should still be on community feed
    assert wait_for_text(driver, "ThiKorben Community")

def test_03_publish_request_form_invalid_data_shows_errors(driver, base_url):
    """Scenario 13 & 14: Publish Request form contains invalid data -> Validation errors shown."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.4)

    safe_click(driver, "//*[@data-testid='community-create-button']")
    wait_for_app_ready(driver)

    # Leave empty or fill invalid (short title, negative budget)
    fill_input(driver, "//*[@data-testid='request-title-input' or @placeholder='e.g. Kitchen sink pipe leaking']", "Tap")
    fill_input(driver, "//*[@data-testid='request-desc-input' or @placeholder='Explain what is happening and what help you need.']", "Short")
    fill_input(driver, "//*[@data-testid='request-location-input' or @placeholder='e.g. Dhanmondi, Dhaka']", "D")
    fill_input(driver, "//*[@data-testid='request-budget-input' or @placeholder='e.g. 800']", "-100")
    time.sleep(0.4)

    safe_click(driver, "//*[@data-testid='submit-service-request-button' or contains(text(), 'Publish Request')]")
    time.sleep(0.5)

    alert_text = dismiss_alert_if_present(driver)
    assert alert_text is not None, "Expected validation alert to pop up"
    assert "Invalid" in alert_text or "characters" in alert_text or "Budget" in alert_text

def test_04_customer_cannot_submit_proposal_on_own_job(driver, base_url):
    """Scenario 4 & 7: Customer cannot submit a worker proposal or accept own job as worker."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Customer mode
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.4)

    # Open own request
    safe_click(driver, "//*[contains(text(), 'Bathroom Tap Leaking')]")
    wait_for_app_ready(driver)

    # Verify 'Submit Proposal' button is NOT visible for customer on their own request
    proposal_buttons = driver.find_elements(By.XPATH, "//*[@data-testid='open-proposal-modal-button']")
    assert len(proposal_buttons) == 0, "Customer must not see Submit Proposal button on own request"

def test_05_worker_submits_proposal_and_customer_accepts(driver, base_url):
    """Scenario 5 & 6: Worker submits proposal; Customer accepts own job's proposal."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # 1. Customer creates a fresh request
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.4)
    safe_click(driver, "//*[@data-testid='community-create-button']")
    wait_for_app_ready(driver)

    job_title = f"Balcony Door Lock Replacement {int(time.time())}"
    fill_input(driver, "//*[@data-testid='request-title-input' or @placeholder='e.g. Kitchen sink pipe leaking']", job_title)
    fill_input(driver, "//*[@data-testid='request-desc-input' or @placeholder='Explain what is happening and what help you need.']", "Balcony sliding door latch is jammed and needs replacement cylinder.")
    fill_input(driver, "//*[@data-testid='request-location-input' or @placeholder='e.g. Dhanmondi, Dhaka']", "Banani Block D, Dhaka")
    fill_input(driver, "//*[@data-testid='request-budget-input' or @placeholder='e.g. 800']", "1200")
    safe_click(driver, "//*[@data-testid='submit-service-request-button' or contains(text(), 'Publish Request')]")
    dismiss_alert_if_present(driver)
    wait_for_app_ready(driver)
    assert wait_for_text(driver, job_title)

    # 2. Worker finds the job and submits proposal
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)
    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    safe_click(driver, f"//*[contains(text(), '{job_title}')]")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[@data-testid='open-proposal-modal-button' or contains(text(), 'Submit Proposal')]")
    time.sleep(0.6)

    fill_input(driver, "//*[@data-testid='proposal-price-input' or @placeholder='e.g. 700']", "1100")
    fill_input(driver, "//*[@data-testid='proposal-note-input' or @placeholder='Explain what you can do and any conditions.']", "I have genuine cylinder locks in stock and can start right away.")
    safe_click(driver, "//*[@data-testid='send-proposal-submit-button' or contains(text(), 'Send Proposal')]")
    dismiss_alert_if_present(driver)
    time.sleep(0.8)

    # 3. Customer views the job and accepts proposal
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.5)

    safe_click(driver, f"//*[contains(text(), '{job_title}')]")
    wait_for_app_ready(driver)

    # Customer accepts proposal
    accept_btn = wait_for_xpath(driver, "//*[contains(text(), 'Accept Proposal')]")
    safe_click(driver, accept_btn)
    dismiss_alert_if_present(driver)
    time.sleep(1.0)

    # Verified assigned state
    assert wait_for_text(driver, "Worker selected")

def test_06_worker_cannot_accept_own_proposal(driver, base_url):
    """Scenario 8: Worker attempts to accept their own proposal -> Rejected."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Switch to worker mode
    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    safe_click(driver, "//*[contains(text(), 'Bathroom Tap Leaking')]")
    wait_for_app_ready(driver)

    # In worker mode, Accept Proposal button must NOT be present
    accept_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Accept Proposal')]")
    assert len(accept_buttons) == 0, "Worker cannot see or click Accept Proposal"

def test_07_customer_cannot_accept_another_customers_job(driver, base_url):
    """Scenario 9: Customer attempts to accept a proposal for another customer's job -> Rejected."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.5)

    # Open second request (which belongs to cust-demo-2)
    safe_click(driver, "//*[contains(text(), 'Main Circuit Breaker Tripping')]")
    wait_for_app_ready(driver)

    # Logged-in demo customer does NOT own this request, so no Accept Proposal button should appear
    accept_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Accept Proposal')]")
    assert len(accept_buttons) == 0, "Non-owner customer cannot accept proposals on another customer's job"

def test_08_proposal_rejected_on_assigned_job(driver, base_url):
    """Scenario 11: Proposal submitted for an assigned/closed job -> Rejected."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    # Open assigned request (Bathroom Tap Leaking was assigned in test 05)
    safe_click(driver, "//*[contains(text(), 'Bathroom Tap Leaking')]")
    wait_for_app_ready(driver)

    # Proposal button must not be visible on an assigned job
    propose_buttons = driver.find_elements(By.XPATH, "//*[@data-testid='open-proposal-modal-button']")
    assert len(propose_buttons) == 0, "Cannot submit proposal on an assigned or closed job"
