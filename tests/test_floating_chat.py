import time
import pytest
from tests.conftest import (
    wait_for_app_ready,
    wait_for_text,
    wait_for_xpath,
    safe_click,
    fill_input,
)

def test_floating_chat_button_renders_globally(driver, base_url):
    """Verify floating chat button is visible on customer dashboard."""
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)

    chat_btn = wait_for_xpath(driver, "//*[@data-testid='floating-chat-trigger-button']")
    assert chat_btn is not None
    assert chat_btn.is_displayed()

def test_floating_chat_opens_and_sends_message(driver, base_url):
    """Verify clicking floating chat button opens drawer, displays history, and can send a message."""
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)

    # Click floating chat trigger button
    safe_click(driver, "//*[@data-testid='floating-chat-trigger-button']")
    time.sleep(0.8)

    # Verify modal is open with Rahim Uddin conversation
    assert wait_for_text(driver, "Rahim Uddin")
    assert wait_for_xpath(driver, "//*[@data-testid='floating-chat-tab-chat']")

    # Send a custom text message
    custom_msg = f"Hello brother, gate is open {int(time.time())}"
    fill_input(driver, "//*[@data-testid='floating-chat-input']", custom_msg)
    time.sleep(0.4)

    # Click send button
    safe_click(driver, "//*[@data-testid='floating-chat-send-btn']")
    time.sleep(0.8)

    # Assert custom message is rendered in the chat thread
    assert wait_for_text(driver, custom_msg)

def test_floating_chat_recent_history_switching(driver, base_url):
    """Verify switching to Recent History tab shows list of conversations and lets user pick one."""
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[@data-testid='floating-chat-trigger-button']")
    time.sleep(0.8)

    # Click Recent History tab
    safe_click(driver, "//*[@data-testid='floating-chat-tab-history']")
    time.sleep(0.6)

    # Verify recent conversations are displayed
    assert wait_for_text(driver, "Active Conversations")
    assert wait_for_text(driver, "Kamal Hossain")

    # Select Kamal Hossain's conversation
    safe_click(driver, "//*[@data-testid='floating-chat-conv-conv-kamal']")
    time.sleep(0.6)

    # Verify chat switched to Kamal Hossain
    assert wait_for_text(driver, "Electrician")
    assert wait_for_text(driver, "Main Breaker Tripping")
