import time
from selenium.webdriver.common.by import By
from tests.conftest import (
    wait_for_app_ready,
    wait_for_text,
    safe_click,
)

def test_job_materials_direct_access_fallback(driver, base_url):
    """
    Direct navigation to /job-materials without query params should NOT crash
    or show 'Materials unavailable. Service request ID is missing.'
    Instead, it should gracefully hydrate the active job materials demo.
    """
    driver.get(f"{base_url}/job-materials")
    wait_for_app_ready(driver)

    # 1. Header and title should be rendered
    header_el = wait_for_text(driver, "Job Materials", timeout=10)
    assert header_el is not None, "Job Materials header must be visible"

    # 2. 'Materials unavailable' must NOT be shown
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Materials unavailable" not in body_text, "Direct access should not show unavailable error"
    assert "Service request ID is missing" not in body_text, "Missing request ID error must not appear"

    # 3. Role switcher should exist
    cust_tab = wait_for_text(driver, "Customer View", timeout=5)
    worker_tab = wait_for_text(driver, "Worker View", timeout=5)
    assert cust_tab is not None
    assert worker_tab is not None

    # 4. Switch to Worker View and verify material request form
    safe_click(driver, worker_tab)
    time.sleep(0.5)

    worker_form_heading = wait_for_text(driver, "Request a material", timeout=5)
    assert worker_form_heading is not None, "Worker form should show in worker mode"

    # 5. Switch back to Customer View
    cust_tab = wait_for_text(driver, "Customer View", timeout=5)
    safe_click(driver, cust_tab)
    time.sleep(0.5)

    # In customer mode, pending items should show Approve / Reject options
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Material requests" in body_text
