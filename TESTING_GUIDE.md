# Quick Testing Guide for Friends

Hey! Thanks for helping test the health tracker app. Here's what to try:

## 🧪 Test #1: Sign Up (2 minutes)

1. Go to the app
2. Click "**Don't have an account? Sign up**"
3. Fill in:
   - Your name
   - Your email  
   - A password (at least **6 characters** - can be simple like `test123`)
4. Click "**Sign Up**"

### ✅ Expected: You should be logged in immediately and see the dashboard

### ❌ If something goes wrong:
- Take a screenshot of any error message
- Share with Supertaro

---

## 🧪 Test #2: Add Some Data (3 minutes)

Try logging some health data:

1. On the **Dashboard**, try the "Quick Log" section
2. Enter some numbers:
   - Steps: `5000`
   - Water: `1500`
   - Sleep: `7.5`
3. Each field should show "**Saved successfully**" when you type

### ✅ Expected: Green success toasts appear, data saves

### ❌ If something goes wrong:
- Do you see any error messages?
- Does nothing happen?
- Take a screenshot

---

## 🧪 Test #3: Navigate Around (2 minutes)

Click through the sidebar menu and check these pages:
- ☐ Dashboard (main page)
- ☐ Cycle Tracker
- ☐ Health Journal
- ☐ Custom Metrics
- ☐ Reminders
- ☐ Settings

### ✅ Expected: Each page loads without errors

### ❌ If something goes wrong:
- Which page crashed?
- What error do you see?
- Take a screenshot

---

## 🧪 Test #4: Log Out and Back In (1 minute)

1. Click your name in the top right
2. Click "**Sign Out**"  
3. Log back in with your email and password

### ✅ Expected: Successfully log back in, see your data

### ❌ If something goes wrong:
- Can't log in?
- Data disappeared?
- Share the error message

---

## 📸 What to Share If You Find Bugs

Please send to Supertaro:

1. **Screenshot** of the error
2. **What you were doing** when it happened
3. **Browser you're using** (Chrome, Safari, Firefox, etc.)
4. **Device** (iPhone, Android, laptop, etc.)

---

## 💬 Common Issues & Quick Fixes

| Problem | Solution |
|---------|----------|
| "Password must be at least 6 characters" | Use a longer password |
| Can't see confirmation email | Check spam folder |
| Page won't load | Try refreshing (F5 or Cmd+R) |
| Button does nothing | Check if there's an error message below the form |

---

## 🎯 What Good Looks Like

- ✅ Signup takes < 10 seconds
- ✅ Everything you click gives feedback (loading, success, or error)
- ✅ Error messages are clear and helpful
- ✅ Data saves and persists after logging out/in

---

## ⚡ Quick Test Scenarios

### Fast Happy Path (30 seconds)
1. Sign up → Enter data → See it saved ✅

### Edge Cases to Try
1. Sign up with same email twice (should show error)
2. Log in with wrong password (should show error)
3. Enter negative numbers in health metrics (should handle gracefully)
4. Click submit button rapidly (should prevent double-submit)

---

**Testing Time:** ~10 minutes total  
**Your help is much appreciated!** 🙏

Found a bug? → Screenshot → Send to Supertaro
Everything works? → Awesome! Let Supertaro know! ✨

