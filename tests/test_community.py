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

def test_community_feed_and_role_toggle(driver, base_url):
    """TC-COMM-001: Community feed loads, displays items, and allows switching customer/worker roles."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Check header title
    assert wait_for_text(driver, "ThiKorben Community")
    # Verify role toggle pills exist
    assert wait_for_text(driver, "Customer Mode")
    assert wait_for_text(driver, "Worker Mode")

    # Toggle to Worker mode
    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    # Toggle back to Customer mode
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.5)

    # Verify seed requests appear
    assert wait_for_text(driver, "Bathroom Tap Leaking")

def test_community_post_comment(driver, base_url):
    """TC-COMM-002: Customer can comment on community post without auth blockers."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Open first request
    safe_click(driver, "//*[contains(text(), 'Bathroom Tap Leaking')]")
    wait_for_app_ready(driver)

    # Verify we are on job board detail
    assert wait_for_text(driver, "Public Discussion")

    # Type comment
    test_comment = f"Is the leak urgent? Test-{int(time.time())}"
    fill_input(
        driver,
        "//*[@data-testid='comment-input' or @placeholder='Write a public comment…']",
        test_comment,
    )
    time.sleep(0.4)

    # Click send button
    safe_click(driver, "//*[@data-testid='send-comment-button']")
    dismiss_alert_if_present(driver)
    time.sleep(1.0)

    # Verify comment appears
    assert wait_for_text(driver, test_comment)

def test_community_submit_and_accept_proposal(driver, base_url):
    """TC-COMM-003: Worker can submit proposal and customer can accept proposal."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # 1. Customer creates a fresh service request
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.4)
    safe_click(driver, "//*[@data-testid='community-create-button']")
    wait_for_app_ready(driver)

    req_title = f"Bathroom Basin Repair {int(time.time())}"
    fill_input(
        driver,
        "//*[@data-testid='request-title-input' or @placeholder='e.g. Kitchen sink pipe leaking']",
        req_title,
    )
    fill_input(
        driver,
        "//*[@data-testid='request-desc-input' or @placeholder='Explain what is happening and what help you need.']",
        "Basin pipe is leaking constantly and needs new washer and sealing.",
    )
    fill_input(
        driver,
        "//*[@data-testid='request-location-input' or @placeholder='e.g. Dhanmondi, Dhaka']",
        "Mirpur 10, Dhaka",
    )
    fill_input(
        driver,
        "//*[@data-testid='request-budget-input' or @placeholder='e.g. 800']",
        "950",
    )
    safe_click(driver, "//*[@data-testid='submit-service-request-button' or contains(text(), 'Publish Request')]")
    dismiss_alert_if_present(driver)
    wait_for_app_ready(driver)

    # 2. Switch to worker mode and open the new request
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)
    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    safe_click(driver, f"//*[contains(text(), '{req_title}')]")
    wait_for_app_ready(driver)

    # Click Submit Proposal button
    safe_click(driver, "//*[@data-testid='open-proposal-modal-button' or contains(text(), 'Submit Proposal')]")
    time.sleep(0.8)

    # Fill proposal price
    fill_input(
        driver,
        "//*[@data-testid='proposal-price-input' or @placeholder='e.g. 700']",
        "750",
    )

    # Fill proposal note
    fill_input(
        driver,
        "//*[@data-testid='proposal-note-input' or @placeholder='Explain what you can do and any conditions.']",
        "I have genuine plumbing parts in stock and can start right away.",
    )
    time.sleep(0.4)

    # Submit proposal
    safe_click(driver, "//*[@data-testid='send-proposal-submit-button' or contains(text(), 'Send Proposal')]")
    dismiss_alert_if_present(driver)
    time.sleep(1.0)

    # 3. Switch back to Customer mode so acceptance is active
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.5)

    safe_click(driver, f"//*[contains(text(), '{req_title}')]")
    wait_for_app_ready(driver)

    # Accept proposal
    accept_btn = wait_for_xpath(driver, "//*[contains(text(), 'Accept Proposal')]")
    safe_click(driver, accept_btn)
    dismiss_alert_if_present(driver)
    time.sleep(1.2)

    # Verify worker selected card is now displayed
    assert wait_for_text(driver, "Worker selected")
    assert wait_for_text(driver, "Progress")
    assert wait_for_text(driver, "Chat")

def test_customer_create_service_request(driver, base_url):
    """TC-COMM-004: Customer can create and publish new service request to community."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Ensure in Customer mode
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.4)

    # Click the + create request button in the header
    create_btn = wait_for_xpath(driver, "//*[@data-testid='community-create-button']")
    safe_click(driver, create_btn)
    wait_for_app_ready(driver)

    # Verify we are on post service request screen
    assert wait_for_text(driver, "Post a Service Request")

    unique_title = f"Emergency Pipe Leak Repair {int(time.time())}"
    fill_input(
        driver,
        "//*[@data-testid='request-title-input' or @placeholder='e.g. Kitchen sink pipe leaking']",
        unique_title,
    )

    fill_input(
        driver,
        "//*[@data-testid='request-desc-input' or @placeholder='Explain what is happening and what help you need.']",
        "Water is gushing out from the secondary joint under the sink. Need urgent repair.",
    )

    fill_input(
        driver,
        "//*[@data-testid='request-location-input' or @placeholder='e.g. Dhanmondi, Dhaka']",
        "Sector 11, Uttara, Dhaka",
    )

    fill_input(
        driver,
        "//*[@data-testid='request-budget-input' or @placeholder='e.g. 800']",
        "1100",
    )
    time.sleep(0.5)

    # Submit request
    submit_btn = wait_for_xpath(
        driver,
        "//*[@data-testid='submit-service-request-button' or contains(text(), 'Publish Request')]"
    )
    safe_click(driver, submit_btn)
    dismiss_alert_if_present(driver)
    wait_for_app_ready(driver)
    time.sleep(1.0)

    # Verify detail view is rendered for the new request
    assert wait_for_text(driver, unique_title)
    assert wait_for_text(driver, "Public Discussion")

