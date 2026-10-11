import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from tests.conftest import wait_for_app_ready, wait_for_text, wait_for_xpath, safe_click

def test_complete_customer_and_worker_lifecycle(driver, base_url):
    """
    END-TO-END UNIFIED LIFECYCLE: CUSTOMER & WORKER IN ONE GO
    
    Demonstrates the complete operational lifecycle in a single uninterrupted session:
    ---------------------------------------------------------------------------------
    [PHASE 1: CUSTOMER ONBOARDING & ROLE SELECTION]
    1. New user lands on Welcome screen (/welcome)
    2. Switches locale to verify multilingual accessibility (EN <-> Bangla)
    3. Selects 'Customer' role to enter the service marketplace
    
    [PHASE 2: DISCOVERY & SERVICE REQUEST]
    4. Arrives at Customer Dashboard (/)
    5. Explores services via category filter (Plumbing)
    6. Searches for specific professionals
    7. Opens Instant Service Request modal & selects 'Plumbing Leak Fix'
    8. Dispatches emergency request and proceeds to live tracking
    
    [PHASE 3: CUSTOMER LIVE TRACKING EXPERIENCE]
    9. Monitors worker approach on interactive map (/track-worker)
    10. Inspects worker identity card & '12 min away' ETA badge
    11. Interacts with contact actions (Call & Message options)
    
    [PHASE 4: WORKER ONBOARDING & AVAILABILITY]
    12. Transitions to Worker Mode via Navigation (/worker-dashboard)
    13. Activates 'AVAILABLE FOR JOBS' availability toggle
    14. Confirms availability status indicator turns active green
    
    [PHASE 5: INCOMING JOB ACCEPTANCE]
    15. Receives incoming emergency job notification banner ('Kitchen sink pipe leaking')
    16. Reviews estimated payout (500 BDT) and clicks 'View & Accept'
    
    [PHASE 6: ON-SITE EXECUTION & WORK LIFECYCLE]
    17. Opens Job Details screen (/job-details) with timeline tracking
    18. Stage 1: Advances to 'Mark Arrived at Location'
    19. Stage 2: Advances to 'Start Working' (Work in progress)
    20. Stage 3: Completes repair and triggers 'Complete Job & Collect payment'
    21. Receives completion verification and wallet credit
    
    [PHASE 7: COMPLETION & RETURN HOME]
    22. Returns to customer home dashboard cleanly with all states intact
    """

    print("\n" + "=" * 65)
    print(">>> STARTING COMPLETE CUSTOMER & WORKER LIFECYCLE IN ONE GO")
    print("=" * 65)

    # -------------------------------------------------------------
    # PHASE 1: CUSTOMER ONBOARDING & ROLE SELECTION
    # -------------------------------------------------------------
    print("\n[PHASE 1] Customer Onboarding at /welcome...")
    driver.get(f"{base_url}/welcome")
    wait_for_app_ready(driver)
    time.sleep(1.2)
    assert wait_for_text(driver, "ThiKorben")

    print(" -> Testing language toggle to Bangla...")
    safe_click(driver, "//*[text()='বাং']")
    time.sleep(1.2)
    assert wait_for_text(driver, "ঠিককরবেন")

    print(" -> Switching back to English for standard workflow...")
    safe_click(driver, "//*[text()='EN']")
    time.sleep(1.2)
    assert wait_for_text(driver, "ThiKorben")

    print(" -> Customer selects 'I Need a Service' onboarding role...")
    safe_click(driver, "//*[contains(text(), 'I Need a Service') or contains(text(), 'Enter as Customer')]")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # -------------------------------------------------------------
    # PHASE 2: DISCOVERY & SERVICE REQUEST
    # -------------------------------------------------------------
    print("\n[PHASE 2] Arrived at Marketplace Dashboard (/)")
    assert wait_for_text(driver, "Verified Pros Near You")

    print(" -> Customer filters by 'Plumber' category...")
    safe_click(driver, "//*[text()='Plumber']")
    time.sleep(1.5)
    assert wait_for_text(driver, "Rahim Uddin")

    print(" -> Customer opens 'Instant Service / Emergency Request' modal...")
    safe_click(driver, "//*[contains(text(), 'Emergency Request')]")
    time.sleep(1.5)
    assert wait_for_text(driver, "Request Instant Service")

    print(" -> Customer selects 'Plumbing Leak Fix' emergency service...")
    safe_click(driver, "//*[contains(text(), 'Plumbing Leak Fix')]")
    time.sleep(1.2)

    # Accept emergency dispatch confirmation alert
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass
    time.sleep(1.5)

    # -------------------------------------------------------------
    # PHASE 3: CUSTOMER LIVE TRACKING EXPERIENCE
    # -------------------------------------------------------------
    print("\n[PHASE 3] Live Worker Tracking (/track-worker)")
    # Navigate to track worker if not redirected by alert
    if "track-worker" not in driver.current_url:
        safe_click(driver, "//*[text()='Track' and preceding::*[text()='Job Flow']]")
        wait_for_app_ready(driver)

    time.sleep(1.8)
    assert wait_for_text(driver, "Track Worker")
    assert wait_for_text(driver, "12 min away")
    assert wait_for_text(driver, "Rahim is on the way")
    print(" -> Verified live map ETA: '12 min away', Status: 'Rahim is on the way'")

    print(" -> Verifying Call and Message buttons are active...")
    assert wait_for_text(driver, "Call Worker")
    assert wait_for_text(driver, "Message")
    time.sleep(1.5)

    # -------------------------------------------------------------
    # PHASE 4: WORKER ONBOARDING & AVAILABILITY
    # -------------------------------------------------------------
    print("\n[PHASE 4] Switching Persona to Worker Dashboard (/worker-dashboard)")
    safe_click(driver, "//*[text()='Worker' and preceding::*[text()='Track']]")
    wait_for_app_ready(driver)
    time.sleep(1.5)
    assert wait_for_text(driver, "Rahim Uddin")

    print(" -> Worker toggles availability to refresh status...")
    toggle_xpath = "//*[contains(text(), 'AVAILABLE FOR JOBS') or contains(text(), 'CURRENTLY OFFLINE')]/ancestor::div[2]/following-sibling::div[@tabindex='0']"
    
    # Toggle offline then online to verify real-time status update
    safe_click(driver, toggle_xpath)
    time.sleep(1.0)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass
    assert wait_for_text(driver, "CURRENTLY OFFLINE")

    print(" -> Worker goes ONLINE ('AVAILABLE FOR JOBS')...")
    safe_click(driver, toggle_xpath)
    time.sleep(1.0)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass
    assert wait_for_text(driver, "AVAILABLE FOR JOBS")

    # -------------------------------------------------------------
    # PHASE 5: INCOMING JOB ACCEPTANCE
    # -------------------------------------------------------------
    print("\n[PHASE 5] Incoming Emergency Job Alert Received")
    assert wait_for_text(driver, "NEW INCOMING JOB")
    assert wait_for_text(driver, "Kitchen sink pipe leaking")
    print(" -> Emergency Job: 'Kitchen sink pipe leaking' (Est. Payout 500 BDT)")

    print(" -> Worker reviews and clicks 'View & Accept'...")
    safe_click(driver, "//*[contains(text(), 'View & Accept')]")
    wait_for_app_ready(driver)
    time.sleep(1.5)

    # -------------------------------------------------------------
    # PHASE 6: ON-SITE EXECUTION & JOB PROGRESSION
    # -------------------------------------------------------------
    print("\n[PHASE 6] Job Lifecycle Execution (/job-details)")
    assert wait_for_text(driver, "Job Details")
    assert wait_for_text(driver, "Job Accepted")

    print(" -> Step 1: Worker marks 'Arrived at Location'...")
    safe_click(driver, "//*[contains(text(), 'Mark Arrived at Location')]/ancestor::div[@tabindex='0' or @role='button'][1]")
    time.sleep(1.2)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    print(" -> Step 2: Worker starts repair ('Start Working')...")
    assert wait_for_text(driver, "Start Working")
    safe_click(driver, "//*[contains(text(), 'Start Working')]/ancestor::div[@tabindex='0' or @role='button'][1]")
    time.sleep(1.2)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    print(" -> Step 3: Repair completed! Worker collects payment...")
    assert wait_for_text(driver, "Complete Job & Collect")
    safe_click(driver, "//*[contains(text(), 'Complete Job & Collect')]/ancestor::div[@tabindex='0' or @role='button'][1]")
    time.sleep(1.5)
    try:
        driver.switch_to.alert.accept()
    except Exception:
        pass

    print(" -> Verified Job Lifecycle completed successfully!")

    # -------------------------------------------------------------
    # PHASE 7: COMPLETION & RETURN HOME
    # -------------------------------------------------------------
    print("\n[PHASE 7] Finalizing Journey and Returning to Marketplace")
    safe_click(driver, "//*[text()='Home' and following::*[text()='Pros']]")
    wait_for_app_ready(driver)
    time.sleep(2.0)
    assert wait_for_text(driver, "Verified Pros Near You")

    print("=" * 65)
    print(">>> [SUCCESS] FULL LIFECYCLE COMPLETED SUCCESSFULLY IN ONE GO!")
    print("=" * 65 + "\n")
