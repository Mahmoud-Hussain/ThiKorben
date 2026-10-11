import time
from selenium.webdriver.common.by import By
from tests.conftest import (
    wait_for_app_ready,
    wait_for_text,
    wait_for_xpath,
    safe_click,
)

def fill_input(driver, xpath, text):
    elem = wait_for_xpath(driver, xpath)
    elem.clear()
    elem.send_keys(text)
    return elem

def test_job_chat_role_switching_suggestion_and_approval(driver, base_url):
    """
    Test job-chat screen:
    1. Direct navigation works without error.
    2. Switch to Worker Mode using either the top tab or the bottom toggle button.
    3. Send message containing '20a double-pole circuit breaker'.
    4. Confirm suggestion window appears with AI component recommendation.
    5. Switch to Customer Mode.
    6. Customer approves the recommended component.
    7. Customer adds component to in-chat demo cart.
    8. Header cart badge reflects live cart count and subtotal.
    """
    driver.get(f"{base_url}/job-chat")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # 1. Verify header and role switcher controls exist
    cust_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-customer']")
    worker_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-worker']")
    identity_toggle = wait_for_xpath(driver, "//*[@data-testid='identity-toggle-btn']")
    assert cust_tab is not None
    assert worker_tab is not None
    assert identity_toggle is not None

    # 2. Switch to Worker Mode
    safe_click(driver, worker_tab)
    time.sleep(0.5)

    # Confirm bottom identity toggle displays Worker
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Worker 🔧" in body_text

    # 3. As worker, send component keyword message
    input_elem = wait_for_xpath(driver, "//input | //textarea")
    input_elem.clear()
    input_elem.send_keys("We need a 20a double-pole circuit breaker and 2.5mm electrical cable for this installation.")
    time.sleep(0.3)

    send_btn = wait_for_xpath(driver, "//*[@aria-label='Send message'] | //*[contains(@accessibilitylabel, 'Send message')]")
    safe_click(driver, send_btn)
    time.sleep(1.0)

    # 4. Recommendation window should be triggered and displayed
    rec_panel = wait_for_xpath(driver, "//*[@data-testid='chat-recommendations-panel']")
    assert rec_panel is not None, "Product recommendation panel must appear"

    rec_text = rec_panel.text
    assert "20A Double-Pole Circuit Breaker" in rec_text

    # Worker cannot approve guard
    assert "Customer Approval Required" in rec_text or "Worker cannot approve" in rec_text or "Pending Customer Review" in rec_text

    # 5. Switch to Customer Mode
    cust_tab = wait_for_xpath(driver, "//*[@data-testid='demo-role-customer']")
    safe_click(driver, cust_tab)
    time.sleep(0.6)

    # 6. Customer approves
    approve_btn = wait_for_xpath(driver, "//*[contains(@data-testid, 'approve-rec-')] | //*[text()='Approve' or contains(text(), 'Approve')]")
    assert approve_btn is not None
    safe_click(driver, approve_btn)
    time.sleep(0.6)

    # 7. Add to demo cart
    cart_add_btn = wait_for_xpath(driver, "//*[contains(@data-testid, 'add-cart-rec-')] | //*[contains(text(), 'Add to Cart')]")
    assert cart_add_btn is not None
    safe_click(driver, cart_add_btn)
    time.sleep(0.6)

    # 8. Header cart button reflects cart items
    header_cart = wait_for_xpath(driver, "//*[@data-testid='header-cart-btn']")
    assert header_cart is not None
    assert "৳" in header_cart.text
