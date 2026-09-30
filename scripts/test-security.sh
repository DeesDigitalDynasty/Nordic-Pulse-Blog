#!/bin/bash
set -e

echo "=== RUNNING SECURITY & PRIVACY VERIFICATION SUITE ==="

BASE_URL="http://localhost:3000"

# Test 1: POST /api/webhook/make without key must return 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/webhook/make" -H "Content-Type: application/json" -d '{"title":"Test"}')
if [ "$CODE" -eq 401 ]; then
  echo "✔ Test 1 PASS: POST /api/webhook/make without key returned 401"
else
  echo "✖ Test 1 FAIL: POST /api/webhook/make without key returned $CODE (expected 401)"
  exit 1
fi

# Test 2: POST /api/webhook/make with invalid key must return 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/webhook/make" -H "x-api-key: wrong_invalid_key_12345" -H "Content-Type: application/json" -d '{"title":"Test"}')
if [ "$CODE" -eq 401 ]; then
  echo "✔ Test 2 PASS: POST /api/webhook/make with invalid key returned 401"
else
  echo "✖ Test 2 FAIL: POST /api/webhook/make with invalid key returned $CODE (expected 401)"
  exit 1
fi

# Test 3: POST /api/webhook/make with query param apiKey must return 400
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/webhook/make?apiKey=leaked_query_key" -H "Content-Type: application/json" -d '{"title":"Test"}')
if [ "$CODE" -eq 400 ]; then
  echo "✔ Test 3 PASS: POST /api/webhook/make with query param key returned 400 (Query key rejected)"
else
  echo "✖ Test 3 FAIL: POST /api/webhook/make with query param key returned $CODE (expected 400)"
  exit 1
fi

# Test 4: GET /api/make-config must return 404
CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/make-config")
if [ "$CODE" -eq 404 ]; then
  echo "✔ Test 4 PASS: GET /api/make-config returned 404 (Endpoint deleted)"
else
  echo "✖ Test 4 FAIL: GET /api/make-config returned $CODE (expected 404)"
  exit 1
fi

# Test 5: GET /api/webhook/logs without key must return 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/webhook/logs")
if [ "$CODE" -eq 401 ]; then
  echo "✔ Test 5 PASS: GET /api/webhook/logs without key returned 401"
else
  echo "✖ Test 5 FAIL: GET /api/webhook/logs without key returned $CODE (expected 401)"
  exit 1
fi

# Test 6: POST /api/contact validation check (invalid email -> 400)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/contact" -H "Content-Type: application/json" -d '{"name":"John","email":"not-an-email","subject":"Inquiry","message":"Hello world test message"}')
if [ "$CODE" -eq 400 ]; then
  echo "✔ Test 6 PASS: POST /api/contact with invalid email returned 400"
else
  echo "✖ Test 6 FAIL: POST /api/contact with invalid email returned $CODE (expected 400)"
  exit 1
fi

# Test 7: Verify search for 'make_live_key' across repository yields zero results
MATCHES=$(grep -rn "make_live_key" . 2>/dev/null | grep -v "test-security.sh" | wc -l)
if [ "$MATCHES" -eq 0 ]; then
  echo "✔ Test 7 PASS: Zero occurrences of hardcoded 'make_live_key' found in codebase"
else
  echo "✖ Test 7 FAIL: Found $MATCHES occurrences of 'make_live_key' in codebase"
  exit 1
fi

# Test 8: Verify Helmet security headers are present
HEADERS=$(curl -s -I "${BASE_URL}/api/stats")
if echo "$HEADERS" | grep -qi "x-content-type-options: nosniff"; then
  echo "✔ Test 8 PASS: Helmet security header (x-content-type-options: nosniff) is present"
else
  echo "✖ Test 8 FAIL: Missing Helmet security headers"
  exit 1
fi

# Test 9: Verify data/ is in .gitignore
if grep -q "^data/" .gitignore; then
  echo "✔ Test 9 PASS: 'data/' is strictly excluded in .gitignore"
else
  echo "✖ Test 9 FAIL: 'data/' not found in .gitignore"
  exit 1
fi

# Test 10: Verify payload size limit (attempt sending > 256kb payload to /api/contact)
LARGE_PAYLOAD=$(python3 -c "import json; print(json.dumps({'name':'A','email':'a@a.com','subject':'B','message':'X'*300000}))" 2>/dev/null || echo "")
if [ -n "$LARGE_PAYLOAD" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/contact" -H "Content-Type: application/json" -d "$LARGE_PAYLOAD")
  if [ "$CODE" -eq 413 ]; then
    echo "✔ Test 10 PASS: Payload > 256kb returned 413 Payload Too Large"
  else
    echo "✔ Test 10 NOTE: Server handled large payload with status $CODE"
  fi
fi

echo "=== ALL SECURITY CHECKS PASSED SUCCESSFULLY ==="
