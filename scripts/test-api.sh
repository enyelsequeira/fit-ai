#!/bin/bash

# Test API Script for Fit AI
# This script helps test the API endpoints with authentication

BASE_URL="${BASE_URL:-http://localhost:3000}"
COOKIE_FILE="/tmp/fit-ai-cookies.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Fit AI API Test Script ===${NC}\n"

# Function to make authenticated requests
auth_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -n "$data" ]; then
    curl -s -X "$method" "${BASE_URL}${endpoint}" \
      -H 'Content-Type: application/json' \
      -b "$COOKIE_FILE" \
      -d "$data"
  else
    curl -s -X "$method" "${BASE_URL}${endpoint}" \
      -b "$COOKIE_FILE"
  fi
}

# 1. Health Check (Public)
echo -e "${YELLOW}1. Health Check${NC}"
curl -s "${BASE_URL}/api/health"
echo -e "\n"

# 2. Sign Up
echo -e "${YELLOW}2. Sign Up${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/sign-up/email" \
  -H 'Content-Type: application/json' \
  -c "$COOKIE_FILE" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }')
echo "$SIGNUP_RESPONSE"
echo -e "\n"

# 3. Sign In (if signup says user exists)
echo -e "${YELLOW}3. Sign In${NC}"
SIGNIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/sign-in/email" \
  -H 'Content-Type: application/json' \
  -c "$COOKIE_FILE" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }')
echo "$SIGNIN_RESPONSE"
echo -e "\n"

# 4. Check Auth Status
echo -e "${YELLOW}4. Check Auth Status${NC}"
auth_request "GET" "/api/auth/check"
echo -e "\n"

# 5. Get Session
echo -e "${YELLOW}5. Get Session${NC}"
auth_request "GET" "/api/auth/session"
echo -e "\n"

# 6. Get Profile
echo -e "${YELLOW}6. Get Profile${NC}"
auth_request "GET" "/api/auth/profile"
echo -e "\n"

# 7. List Exercises (Public)
echo -e "${YELLOW}7. List Exercises (first 5)${NC}"
curl -s "${BASE_URL}/api/exercises?limit=5" | head -c 500
echo -e "\n\n"

# 8. List Exercises with Filters
echo -e "${YELLOW}8. List Exercises - Chest Category${NC}"
curl -s "${BASE_URL}/api/exercises?category=chest&limit=3"
echo -e "\n"

# 9. Get Equipment List
echo -e "${YELLOW}9. Get Equipment List${NC}"
curl -s "${BASE_URL}/api/exercises/equipment"
echo -e "\n"

# 10. Get Muscle Groups
echo -e "${YELLOW}10. Get Muscle Groups${NC}"
curl -s "${BASE_URL}/api/exercises/muscle-groups"
echo -e "\n"

# 11. Create a Custom Exercise (Protected)
echo -e "${YELLOW}11. Create Custom Exercise${NC}"
auth_request "POST" "/api/exercises" '{
  "name": "My Custom Exercise",
  "description": "A test exercise",
  "category": "chest",
  "muscleGroups": ["chest", "triceps"],
  "equipment": "dumbbell",
  "exerciseType": "strength"
}'
echo -e "\n"

# 12. List Templates (Protected)
echo -e "${YELLOW}12. List Templates${NC}"
auth_request "GET" "/api/templates"
echo -e "\n"

# 13. Create Template Folder (Protected)
echo -e "${YELLOW}13. Create Template Folder${NC}"
auth_request "POST" "/api/template-folders" '{
  "name": "My Workout Plans"
}'
echo -e "\n"

# 14. Create Workout Template (Protected)
echo -e "${YELLOW}14. Create Workout Template${NC}"
auth_request "POST" "/api/templates" '{
  "name": "Push Day",
  "description": "Chest, shoulders, and triceps workout"
}'
echo -e "\n"

# 15. List Workouts (Protected)
echo -e "${YELLOW}15. List Workouts${NC}"
auth_request "GET" "/api/workouts"
echo -e "\n"

# 16. Create Workout (Protected)
echo -e "${YELLOW}16. Start New Workout${NC}"
auth_request "POST" "/api/workouts" '{
  "name": "Morning Workout"
}'
echo -e "\n"

# 17. List Progress Photos (Protected)
echo -e "${YELLOW}17. List Progress Photos${NC}"
auth_request "GET" "/api/progress-photos"
echo -e "\n"

# Sign Out
echo -e "${YELLOW}18. Sign Out${NC}"
curl -s -X POST "${BASE_URL}/api/auth/sign-out" -b "$COOKIE_FILE" -c "$COOKIE_FILE"
echo -e "\n"

# Verify signed out
echo -e "${YELLOW}19. Verify Signed Out${NC}"
auth_request "GET" "/api/auth/check"
echo -e "\n"

echo -e "${GREEN}=== Test Complete ===${NC}"
echo -e "Cookie file: ${COOKIE_FILE}"
