import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    StaleElementReferenceException,
    NoSuchElementException,
    ElementClickInterceptedException,
)

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8081")

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL

@pytest.fixture(scope="function")
def driver():
    chrome_options = Options()
    
    # Headless only if explicitly requested via HEADLESS=1
    if os.environ.get("HEADLESS", "0") == "1":
        chrome_options.add_argument("--headless=new")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=430,920")
    chrome_options.add_argument("--window-position=160,50")
    chrome_options.add_argument("--log-level=3")

    # Mobile emulation
    mobile_emulation = {
        "deviceMetrics": {"width": 390, "height": 844, "pixelRatio": 3.0},
        "userAgent": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
    }
    chrome_options.add_experimental_option("mobileEmulation", mobile_emulation)

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(2)
    driver.set_page_load_timeout(30)
    yield driver
    try:
        time.sleep(1.0)
        driver.quit()
    except Exception:
        pass

def wait_for_app_ready(driver, timeout=12):
    """Waits for React root and document readiness to ensure hydration is complete."""
    wait = WebDriverWait(driver, timeout, poll_frequency=0.2)
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
    time.sleep(0.8)

def xpath_text_query(text):
    """Safely builds an XPath string handling single and double quotes."""
    if "'" not in text:
        return f"//*[contains(text(), '{text}')]"
    if '"' not in text:
        return f'//*[contains(text(), "{text}")]'
    parts = text.split("'")
    concat_args = ", \"'\", ".join(f'"{p}"' for p in parts)
    return f"//*[contains(text(), concat({concat_args}))]"

def wait_for_text(driver, text, timeout=10):
    """Robustly locates an element with text, surviving React re-renders & hydration."""
    xpath = xpath_text_query(text)
    wait = WebDriverWait(
        driver,
        timeout,
        poll_frequency=0.3,
        ignored_exceptions=(StaleElementReferenceException, NoSuchElementException),
    )

    def _finder(d):
        elements = d.find_elements(By.XPATH, xpath)
        for el in elements:
            try:
                if el.is_displayed():
                    return el
            except StaleElementReferenceException:
                continue
        return False

    return wait.until(_finder)

def wait_for_xpath(driver, xpath, timeout=10):
    """Robustly locates an element by xpath, surviving stale elements."""
    wait = WebDriverWait(
        driver,
        timeout,
        poll_frequency=0.3,
        ignored_exceptions=(StaleElementReferenceException, NoSuchElementException),
    )

    def _finder(d):
        elements = d.find_elements(By.XPATH, xpath)
        for el in elements:
            try:
                if el.is_displayed():
                    return el
            except StaleElementReferenceException:
                continue
        return False

    return wait.until(_finder)

def safe_click(driver, target, timeout=10):
    """
    Safely clicks an element or XPath, highlighting the element on screen
    and adding slight visual pacing so user can clearly see actions live.
    """
    wait = WebDriverWait(
        driver,
        timeout,
        poll_frequency=0.3,
        ignored_exceptions=(
            StaleElementReferenceException,
            NoSuchElementException,
            ElementClickInterceptedException,
        ),
    )

    def _clicker(d):
        if isinstance(target, str):
            elements = d.find_elements(By.XPATH, target)
            elem = None
            for el in elements:
                try:
                    if el.is_displayed():
                        elem = el
                        break
                except StaleElementReferenceException:
                    continue
            if not elem:
                return False
        else:
            elem = target

        try:
            # Highlight element with a glow so user sees where the click happens
            d.execute_script(
                "arguments[0].scrollIntoView({block: 'center', inline: 'center'});"
                "arguments[0].style.outline = '3px solid #F7941D';"
                "arguments[0].style.transition = 'outline 0.3s';",
                elem
            )
            time.sleep(0.4)
            elem.click()
            time.sleep(0.6)
            return True
        except Exception:
            try:
                d.execute_script("arguments[0].click();", elem)
                time.sleep(0.6)
                return True
            except Exception:
                return False

    return wait.until(_clicker)
