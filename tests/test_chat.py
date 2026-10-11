import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.conftest import wait_for_app_ready, safe_click

def test_chat_screen_direct_render(driver, base_url):
    """Verify chat screen renders with header, context banner, messages, and input bar."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Check Recipient header
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Rahim Uddin" in body_text
    assert "Online" in body_text

    # Check Service Context Banner
    assert "Plumbing Leak Fix" in body_text or "Plumber" in body_text

    # Check default messages
    assert "আসসালামু আলাইকুম" in body_text

    # Check Quick Chips exist
    assert "কতক্ষণ লাগবে ভাই?" in body_text or "দরজার সামনে আছি" in body_text

def test_chat_interaction_quick_chip_and_send(driver, base_url):
    """Test clicking a quick reply chip and sending custom message."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Click a quick chip
    chip = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'কতক্ষণ লাগবে ভাই?')]"))
    )
    safe_click(driver, chip)
    time.sleep(2.0)

    # Verify message was posted and auto-reply arrived
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "কতক্ষণ লাগবে ভাই?" in body_text
    assert "মিনিটের মধ্যে" in body_text or "পৌঁছে" in body_text

    # Test typing custom message
    text_inputs = driver.find_elements(By.TAG_NAME, "input")
    assert len(text_inputs) > 0
    input_elem = text_inputs[0]
    input_elem.clear()
    input_elem.send_keys("Hello, please call when you reach")
    time.sleep(0.5)

    # Click send button
    send_btn = driver.find_element(By.XPATH, "//*[@aria-label='Send message' or @accessibilitylabel='Send message']")
    safe_click(driver, send_btn)
    time.sleep(2.0)

    body_text_after = driver.find_element(By.TAG_NAME, "body").text
    assert "Hello, please call when you reach" in body_text_after

def test_navigation_to_chat_from_track_worker(driver, base_url):
    """Verify clicking Message in Track Worker screen navigates directly into Chat."""
    driver.get(f"{base_url}/track-worker")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Find and click Message button
    msg_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//*[text()='Message' or contains(text(), 'Message')]"))
    )
    safe_click(driver, msg_btn)
    time.sleep(1.5)

    assert "/chat" in driver.current_url
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Rahim Uddin" in body_text
    assert "Plumbing" in body_text
