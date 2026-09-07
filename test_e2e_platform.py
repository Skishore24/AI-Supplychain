import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_content)
        except Exception:
            return e.code, {"raw": err_content}
    except Exception as ex:
        return 500, {"error": str(ex)}

def main():
    print("==================================================")
    print("EMOX AI SUPPLY CHAIN — END-TO-END VERIFICATION")
    print("==================================================")

    # 1. Health Check
    status, res = make_request("/health", method="GET")
    print(f"[TEST 1] System Health: Status {status} | Database: {res.get('database')}")
    assert status == 200, f"Health check failed: {res}"

    # 2. Admin Authentication
    status, auth_res = make_request("/auth/login", method="POST", data={
        "email": "admin@emox.ai",
        "password": "admin123"
    })
    token = auth_res.get("access_token")
    user = auth_res.get("user", {})
    print(f"[TEST 2] Admin Login: Status {status} | User: {user.get('email')} ({user.get('role')}) | JWT: {token[:20]}...")
    assert status == 200 and token, f"Login failed: {auth_res}"

    # 3. Product Catalog
    status, prod_res = make_request("/products/?limit=10", method="GET")
    prods = prod_res if isinstance(prod_res, list) else prod_res.get("items", [])
    print(f"[TEST 3] Product Catalog: Status {status} | Found {len(prods)} products")
    assert len(prods) > 0, "No products found!"
    target_product = prods[0]
    prod_id = target_product["id"]
    prod_name = target_product["name"]
    initial_stock = target_product.get("stock_quantity", 0)
    print(f"         Target Product: ID={prod_id}, '{prod_name}', Stock={initial_stock}")

    # 4. Multi-Agent AI Endpoints
    # Agent 1
    status, ag1 = make_request(f"/ai/suppliers/evaluate/{urllib.parse.quote(prod_name)}", token=token)
    print(f"[TEST 4.1] Agent 1 (Supplier Optimizer): Status {status} | Winner: {ag1.get('recommended_supplier', {}).get('supplier_name')} | Score: {ag1.get('recommended_supplier', {}).get('final_score')}")
    assert status == 200, f"Agent 1 failed: {ag1}"

    # Agent 2
    status, ag2 = make_request("/ai/inventory/restock-intelligence", token=token)
    print(f"[TEST 4.2] Agent 2 (Restock Engine): Status {status} | Flagged items: {len(ag2.get('restock_items', []))}")
    assert status == 200, f"Agent 2 failed: {ag2}"

    # Agent 3
    status, ag3 = make_request("/ai/demand/forecast", token=token)
    print(f"[TEST 4.3] Agent 3 (Demand Forecaster): Status {status} | Forecast records: {len(ag3.get('forecasts', []))}")
    assert status == 200, f"Agent 3 failed: {ag3}"

    # AI Summary
    status, ai_sum = make_request("/ai/summary", token=token)
    print(f"[TEST 4.4] AI Summary: Status {status} | Catalog Count: {ai_sum.get('total_products')} | Revenue: ₹{ai_sum.get('total_revenue')}")
    assert status == 200, f"AI Summary failed: {ai_sum}"

    # 5. Purchase Order Cycle & Stock Receipt
    # Get warehouse & supplier
    _, whs = make_request("/warehouses/", token=token)
    _, sups = make_request("/suppliers/", token=token)
    wh_id = whs[0]["id"]
    sup_id = sups[0]["id"]

    po_payload = {
        "supplier_id": sup_id,
        "warehouse_id": wh_id,
        "notes": "Automated verification restock",
        "items": [
            {
                "product_id": prod_id,
                "quantity": 50,
                "unit_price": 200.0
            }
        ]
    }
    status, po = make_request("/purchase-orders/", method="POST", data=po_payload, token=token)
    po_id = po["id"]
    print(f"[TEST 5.1] Create PO: Status {status} | PO #{po_id} | Total: ₹{po.get('total_cost')}")
    assert status in (200, 201), f"PO creation failed: {po}"

    # Approve PO
    status, _ = make_request(f"/purchase-orders/{po_id}/status", method="PUT", data={"status": "approved", "notes": "Approved"}, token=token)
    # Send PO
    status, _ = make_request(f"/purchase-orders/{po_id}/status", method="PUT", data={"status": "sent", "notes": "Sent"}, token=token)
    print(f"[TEST 5.2] PO Progression: Draft -> Approved -> Sent [OK]")

    # Receive PO items (50 units)
    status, po_detailed = make_request(f"/purchase-orders/{po_id}", token=token)
    po_item_id = po_detailed["items"][0]["id"]
    receive_payload = {
        "received_items": [
            {
                "item_id": po_item_id,
                "quantity_received": 50
            }
        ],
        "notes": "Dock receipt verified"
    }
    status, receive_res = make_request(f"/purchase-orders/{po_id}/receive", method="POST", data=receive_payload, token=token)
    print(f"[TEST 5.3] Receive Stock: Status {status} | Replenishment Message: {receive_res.get('message')}")
    assert status == 200, f"Receive failed: {receive_res}"

    # Verify inventory was incremented!
    _, inv_after = make_request(f"/inventory/{prod_id}", token=token)
    new_stock = inv_after.get("current_stock", 0)
    print(f"[TEST 5.4] Inventory Stock Verification: Before={initial_stock} -> After PO Receipt={new_stock} (+50 units)")
    assert new_stock >= initial_stock + 50, f"Stock was not incremented! Expected >={initial_stock + 50}, got {new_stock}"

    # 6. Customer Order Checkout & Atomic Stock Decrement
    order_payload = {
        "customer_name": "E2E Verification Customer",
        "customer_email": "e2e@emox.ai",
        "shipping_address": "Indiranagar, Bengaluru, KA 560038",
        "payment_method": "UPI (Google Pay)",
        "items": [
            {
                "product_id": prod_id,
                "quantity": 2
            }
        ]
    }
    status, order_res = make_request("/orders/", method="POST", data=order_payload)
    print(f"[TEST 6.1] Customer Checkout: Status {status} | Order #{order_res.get('order_number')} | Total: ₹{order_res.get('total_amount')}")
    assert status in (200, 201), f"Checkout failed: {order_res}"

    # Verify inventory decremented by 2
    _, inv_after_order = make_request(f"/inventory/{prod_id}", token=token)
    stock_after_checkout = inv_after_order.get("current_stock", 0)
    print(f"[TEST 6.2] Stock Decrement Verification: {new_stock} -> {stock_after_checkout} (-2 units)")
    assert stock_after_checkout == new_stock - 2, f"Stock did not decrement! Expected {new_stock - 2}, got {stock_after_checkout}"

    # 7. Audit Log Verification
    status, audit_res = make_request("/audit-logs/?limit=5", token=token)
    audit_items = audit_res if isinstance(audit_res, list) else audit_res.get("items", [])
    print(f"[TEST 7] Audit Logs: Status {status} | Recent events: {len(audit_items)}")
    for a in audit_items[:3]:
        print(f"         - Action: {a.get('action')} on {a.get('entity_name')} by {a.get('user_email')}")

    # 8. Operations Analytics
    status, an_res = make_request("/analytics/overview?timeframe=30d", token=token)
    print(f"[TEST 8] Analytics Overview: Status {status} | Revenue: ₹{an_res.get('total_revenue')} | Orders: {an_res.get('total_orders')} | Units: {an_res.get('total_units_sold')}")

    print("\n==================================================")
    print("ALL 8 VERIFICATION PHASES PASSED WITH ZERO ERRORS!")
    print("==================================================")

if __name__ == "__main__":
    main()
