import time
import pytest
from selenium.webdriver.common.by import By
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

def test_floating_chat_hidden_on_fullscreen_chat_page(driver, base_url):
    """Verify floating chat and pages switcher are hidden on /chat so they never cover send button."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)

    # Floating chat trigger button must not be present on /chat
    floating_triggers = driver.find_elements(By.XPATH, "//*[@data-testid='floating-chat-trigger-button']")
    assert len(floating_triggers) == 0, "Floating chat button should not render on full-screen /chat page"

    # Full screen chat input and send button should be present and unobstructed
    input_box = wait_for_xpath(driver, "//*[@data-testid='chat-input']")
    assert input_box is not None
    send_btn = wait_for_xpath(driver, "//*[@data-testid='chat-send-btn']")
    assert send_btn is not None

def test_start_new_chat_with_new_worker_from_pro_directory(driver, base_url):
    """Verify user can initiate a new chat with a new worker from the available pros directory."""
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)

    safe_click(driver, "//*[@data-testid='floating-chat-trigger-button']")
    time.sleep(0.8)

    # Switch to Recent History
    safe_click(driver, "//*[@data-testid='floating-chat-tab-history']")
    time.sleep(0.6)

    # Verify directory section is present
    assert wait_for_text(driver, "Start New Chat with Pro")
    assert wait_for_text(driver, "Tariqul Islam")

    # Start chat with Tariqul Islam
    safe_click(driver, "//*[@data-testid='floating-chat-start-worker-demo-3']")
    time.sleep(0.8)

    # Verify chat switched to Tariqul Islam and Carpentry context
    assert wait_for_text(driver, "Tariqul Islam")
    assert wait_for_text(driver, "Carpenter")

def test_front_page_has_prominent_signup_button(driver, base_url):
    """Verify front page provides explicit Sign Up button in header and hero."""
    driver.get(f"{base_url}/")
    wait_for_app_ready(driver)

    # Header Sign Up button
    signup_header = wait_for_xpath(driver, "//*[@data-testid='header-signup-btn']")
    assert signup_header is not None
    assert signup_header.is_displayed()

    # Hero action Sign Up Free button
    signup_hero = wait_for_xpath(driver, "//*[@data-testid='hero-signup-btn']")
    assert signup_hero is not None
    assert signup_hero.is_displayed()

