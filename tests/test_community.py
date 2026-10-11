import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

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
    comment_input = wait_for_xpath(
        driver,
        "//*[@data-testid='comment-input' or @placeholder='Write a public comment…']"
    )
    test_comment = f"Is the leak urgent? Test-{int(time.time())}"
    comment_input.clear()
    comment_input.send_keys(test_comment)
    time.sleep(0.4)

    # Click send button
    safe_click(driver, "//*[@data-testid='send-comment-button']")
    time.sleep(1.0)

    # Verify comment appears
    assert wait_for_text(driver, test_comment)

def test_community_submit_and_accept_proposal(driver, base_url):
    """TC-COMM-003: Worker can submit proposal and customer can accept proposal."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Switch to worker mode and open the request
    safe_click(driver, "//*[@data-testid='role-worker-toggle' or contains(text(), 'Worker Mode')]")
    time.sleep(0.5)

    safe_click(driver, "//*[contains(text(), 'Bathroom Tap Leaking')]")
    wait_for_app_ready(driver)

    # Click Submit Proposal button
    safe_click(driver, "//*[@data-testid='open-proposal-modal-button' or contains(text(), 'Submit Proposal')]")
    time.sleep(0.8)

    # Fill proposal price
    price_input = wait_for_xpath(
        driver,
        "//*[@data-testid='proposal-price-input' or @placeholder='e.g. 700']"
    )
    price_input.clear()
    price_input.send_keys("750")

    # Fill proposal note
    note_input = wait_for_xpath(
        driver,
        "//*[@data-testid='proposal-note-input' or @placeholder='Explain what you can do and any conditions.']"
    )
    note_input.clear()
    note_input.send_keys("I have genuine plumbing parts in stock and can start right away.")
    time.sleep(0.4)

    # Submit proposal
    safe_click(driver, "//*[@data-testid='send-proposal-submit-button' or contains(text(), 'Send Proposal')]")
    time.sleep(1.0)

    # Switch back to Customer mode so acceptance is active
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)
    safe_click(driver, "//*[@data-testid='role-customer-toggle' or contains(text(), 'Customer Mode')]")
    time.sleep(0.5)

    safe_click(driver, "//*[contains(text(), 'Bathroom Tap Leaking')]")
    wait_for_app_ready(driver)

    # Accept proposal
    accept_btn = wait_for_xpath(driver, "//*[contains(text(), 'Accept Proposal')]")
    safe_click(driver, accept_btn)
    time.sleep(1.2)

    # Verify worker selected card is now displayed
    assert wait_for_text(driver, "Worker selected")
    assert wait_for_text(driver, "Progress")
    assert wait_for_text(driver, "Chat")

def test_customer_create_service_request(driver, base_url):
    """TC-COMM-004: Customer can create and publish new service request to community."""
    driver.get(f"{base_url}/community")
    wait_for_app_ready(driver)

    # Click the + create request button in the header
    create_btn = wait_for_xpath(driver, "//*[@data-testid='community-create-button']")
    safe_click(driver, create_btn)
    wait_for_app_ready(driver)

    # Verify we are on post service request screen
    assert wait_for_text(driver, "Post a Service Request")

    unique_title = f"Emergency Pipe Leak Repair {int(time.time())}"
    title_input = wait_for_xpath(
        driver,
        "//*[@data-testid='request-title-input' or @placeholder='e.g. Kitchen sink pipe leaking']"
    )
    title_input.send_keys(unique_title)

    desc_input = wait_for_xpath(
        driver,
        "//*[@data-testid='request-desc-input' or @placeholder='Explain what is happening and what help you need.']"
    )
    desc_input.send_keys("Water is gushing out from the secondary joint under the sink. Need urgent repair.")

    loc_input = wait_for_xpath(
        driver,
        "//*[@data-testid='request-location-input' or @placeholder='e.g. Dhanmondi, Dhaka']"
    )
    loc_input.send_keys("Sector 11, Uttara, Dhaka")

    budget_input = wait_for_xpath(
        driver,
        "//*[@data-testid='request-budget-input' or @placeholder='e.g. 800']"
    )
    budget_input.send_keys("1100")
    time.sleep(0.5)

    # Submit request
    submit_btn = wait_for_xpath(
        driver,
        "//*[@data-testid='submit-service-request-button' or contains(text(), 'Publish Request')]"
    )
    safe_click(driver, submit_btn)
    wait_for_app_ready(driver)
    time.sleep(1.0)

    # Verify detail view is rendered for the new request
    assert wait_for_text(driver, unique_title)
    assert wait_for_text(driver, "Public Discussion")
