import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.conftest import wait_for_app_ready, safe_click, wait_for_text, wait_for_xpath

def fill_input(driver, xpath, text):
    elem = wait_for_xpath(driver, xpath)
    elem.clear()
    elem.send_keys(text)
    return elem

def test_demo_role_switcher_toggles_mode_and_preserves_conversation(driver, base_url):
    """Verify demo switcher switches between Customer and Worker modes seamlessly."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Check top role switcher is visible
    customer_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-customer']")
    worker_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-worker']")
    assert customer_tab is not None
    assert worker_tab is not None

    body_text_init = driver.find_element(By.TAG_NAME, "body").text
    assert "Rahim Uddin" in body_text_init

    # Switch to Worker mode
    safe_click(driver, worker_tab)
    time.sleep(1.2)

    body_text_worker = driver.find_element(By.TAG_NAME, "body").text
    # In worker mode, parts mention quick chips appear
    assert "20A double-pole circuit breaker" in body_text_worker or "water pump" in body_text_worker

    # Switch back to Customer mode
    customer_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-customer']")
    safe_click(driver, customer_tab)
    time.sleep(1.2)

    body_text_customer = driver.find_element(By.TAG_NAME, "body").text
    # Messages must be preserved
    assert "Rahim Uddin" in body_text_customer
    assert "আসসালামু আলাইকুম" in body_text_customer


def test_component_detection_triggers_inline_recommendation(driver, base_url):
    """Test worker mentioning parts triggers inline product recommendations."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Switch to Worker mode
    worker_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-worker']")
    safe_click(driver, worker_tab)
    time.sleep(1.0)

    # Type worker message mentioning circuit breaker and electrical cable
    text_inputs = driver.find_elements(By.TAG_NAME, "input")
    assert len(text_inputs) > 0
    input_elem = text_inputs[0]
    input_elem.clear()
    mention_msg = "We need a 20A double-pole circuit breaker and 2.5mm electrical cable for this installation."
    input_elem.send_keys(mention_msg)
    time.sleep(0.5)

    # Send message
    send_btn = driver.find_element(By.XPATH, "//*[@aria-label='Send message' or @accessibilitylabel='Send message']")
    safe_click(driver, send_btn)
    time.sleep(2.0)

    # Verify message was posted
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "20A double-pole circuit breaker" in body_text

    # Verify AI recommendation panel was triggered
    rec_panel = wait_for_xpath(driver, "//*[@data-testid='chat-recommendations-panel']")
    assert rec_panel is not None
    panel_text = rec_panel.text
    assert "AI Component Recommendations" in panel_text
    assert "20A Double-Pole Circuit Breaker" in panel_text
    assert "Electrical Wire" in panel_text or "2.5mm" in panel_text

    # Verify AI Assistant system announcement
    assert "AI Assistant identified" in body_text


def test_worker_cannot_approve_customer_approval_flow(driver, base_url):
    """Verify worker cannot approve components, and customer approval flow updates state."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Switch to Worker mode
    worker_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-worker']")
    safe_click(driver, worker_tab)
    time.sleep(1.0)

    # Send message with a component mention
    text_inputs = driver.find_elements(By.TAG_NAME, "input")
    input_elem = text_inputs[0]
    input_elem.clear()
    input_elem.send_keys("We need a replacement water pump for the roof tank.")
    time.sleep(0.5)
    send_btn = driver.find_element(By.XPATH, "//*[@aria-label='Send message' or @accessibilitylabel='Send message']")
    safe_click(driver, send_btn)
    time.sleep(2.0)

    # In Worker mode, approve button is restricted for worker
    rec_panel = wait_for_xpath(driver, "//*[@data-testid='chat-recommendations-panel']")
    assert "Worker cannot approve" in rec_panel.text or "Pending Customer Review" in rec_panel.text

    # Now switch to Customer mode
    customer_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-customer']")
    safe_click(driver, customer_tab)
    time.sleep(1.2)

    # Find Approve button on the recommendation card
    approve_btns = driver.find_elements(
        By.XPATH, "//*[contains(@data-testid, 'rec-btn-approve-') or contains(text(), 'Approve')]"
    )
    assert len(approve_btns) > 0
    safe_click(driver, approve_btns[-1])
    time.sleep(1.5)

    # Check status updated to Approved
    body_text_after = driver.find_element(By.TAG_NAME, "body").text
    assert "Approved" in body_text_after or "APPROVED" in body_text_after


def test_in_chat_cart_and_subtotal_calculation(driver, base_url):
    """Verify adding approved component to cart updates cart badge, subtotal, and cart modal."""
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Switch to Worker mode to generate a recommendation first
    worker_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-worker']")
    safe_click(driver, worker_tab)
    time.sleep(0.8)

    text_inputs = driver.find_elements(By.TAG_NAME, "input")
    input_elem = text_inputs[0]
    input_elem.clear()
    input_elem.send_keys("Please approve 20A double-pole circuit breaker.")
    time.sleep(0.5)
    send_btn = driver.find_element(By.XPATH, "//*[@aria-label='Send message' or @accessibilitylabel='Send message']")
    safe_click(driver, send_btn)
    time.sleep(1.5)

    # Switch to Customer mode to approve & add
    customer_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-customer']")
    safe_click(driver, customer_tab)
    time.sleep(1.0)

    # Click Approve button on the recommendation card
    approve_btns = driver.find_elements(
        By.XPATH, "//*[contains(@data-testid, 'rec-btn-approve-') or contains(text(), 'Approve')]"
    )
    if len(approve_btns) > 0:
        safe_click(driver, approve_btns[-1])
        time.sleep(1.2)

    # Look for Add to Cart button on approved card
    cart_add_btns = driver.find_elements(
        By.XPATH, "//*[contains(@data-testid, 'rec-btn-add-cart-') or contains(text(), 'Add to Cart')]"
    )
    assert len(cart_add_btns) > 0
    safe_click(driver, cart_add_btns[-1])
    time.sleep(1.5)

    # Verify in-chat cart shortcut button in top header
    header_cart_btn = wait_for_xpath(driver, "//*[@data-testid='header-cart-btn']")
    assert header_cart_btn is not None
    header_text = header_cart_btn.text
    # Should show currency symbol
    assert "৳" in header_text

    # Open In-Chat Cart Modal
    safe_click(driver, header_cart_btn)
    time.sleep(1.5)

    modal_panel = wait_for_xpath(driver, "//*[@data-testid='in-chat-cart-modal']")
    assert modal_panel is not None
    modal_text = modal_panel.text
    assert "In-Chat Demo Cart" in modal_text
    assert "Subtotal" in modal_text

    # Close Cart Modal and return to chat
    close_cart_btn = wait_for_xpath(driver, "//*[@data-testid='close-in-chat-cart-btn']")
    safe_click(driver, close_cart_btn)
    time.sleep(1.0)

    # Verify we returned to conversation without losing messages
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Rahim Uddin" in body_text


def test_floating_chat_and_main_chat_synchronization(driver, base_url):
    """Verify bidirectional synchronization between main chat and floating chat widget."""
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # 1. Open Floating Chat and send a unique message
    unique_text = f"Sync test from floating at {int(time.time())}"
    safe_click(driver, "//*[@data-testid='floating-chat-trigger-button']")
    time.sleep(1.0)

    assert wait_for_text(driver, "Rahim Uddin")
    fill_input(driver, "//*[@data-testid='floating-chat-input']", unique_text)
    time.sleep(0.4)
    safe_click(driver, "//*[@data-testid='floating-chat-send-btn']")
    time.sleep(1.2)

    # 2. Navigate to main /chat page
    driver.get(f"{base_url}/chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # Verify message sent from floating chat appears in main chat!
    assert wait_for_text(driver, unique_text)

    # 3. Send reply in main /chat page
    reply_text = f"Sync reply from main chat {int(time.time())}"
    text_inputs = driver.find_elements(By.TAG_NAME, "input")
    input_elem = text_inputs[0]
    input_elem.clear()
    input_elem.send_keys(reply_text)
    time.sleep(0.4)
    send_btn = driver.find_element(By.XPATH, "//*[@aria-label='Send message' or @accessibilitylabel='Send message']")
    safe_click(driver, send_btn)
    time.sleep(1.5)

    # 4. Navigate back to dashboard and open floating chat
    driver.get(f"{base_url}/customer-dashboard")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    safe_click(driver, "//*[@data-testid='floating-chat-trigger-button']")
    time.sleep(1.0)

    # Verify reply sent from main chat appears in floating chat widget!
    assert wait_for_text(driver, reply_text)
