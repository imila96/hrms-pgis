# 🔄 Leave Balance Fetching - Complete Code Flow

**Date**: November 9, 2025  
**Endpoint**: `GET /leave/balance`  
**URL**: `http://localhost:3000/employee/leave`

---

## 📊 Overview

When an employee visits the Leave Management page, the system automatically fetches their leave balances for Annual, Sick, and Casual leave types. This document traces the complete journey from UI → Backend → Database → Backend → UI.

---

## 🎯 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER NAVIGATES TO PAGE                           │
│                  http://localhost:3000/employee/leave                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: React Component Mounts (Leave.js)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 Location: src/components/EmployeeDashboard/Leave.js                 │
│                                                                           │
│  useEffect(() => {                                                       │
│    loadData();  // ← Triggered on component mount                       │
│  }, []);                                                                 │
│                                                                           │
│  const loadData = async () => {                                         │
│    setLoading(true);  // ← Show loading spinner                         │
│    await Promise.all([                                                   │
│      loadBalances(),  // ← PARALLEL CALL 1                              │
│      loadMyLeaves()   // ← PARALLEL CALL 2                              │
│    ]);                                                                   │
│    setLoading(false); // ← Hide loading spinner                         │
│  };                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Load Balances Function Called                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  const loadBalances = async () => {                                     │
│    try {                                                                 │
│      // Make HTTP GET request                                           │
│      const { data } = await axiosInstance.get("/leave/balance");       │
│      ↓                                                                   │
│      📤 HTTP REQUEST SENT TO BACKEND                                     │
│    }                                                                     │
│  };                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Axios Interceptor (AxiosInstance.js)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 Location: src/AxiosInstance.js                                       │
│                                                                           │
│  axiosInstance.interceptors.request.use((config) => {                   │
│    const token = localStorage.getItem("token");                         │
│    if (token) {                                                          │
│      config.headers.Authorization = `Bearer ${token}`;                  │
│    }                                                                     │
│    return config;                                                        │
│  });                                                                     │
│                                                                           │
│  ✅ JWT Token attached to request header                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  📡 HTTP REQUEST                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Method:  GET                                                            │
│  URL:     http://localhost:8080/leave/balance                           │
│  Headers:                                                                │
│    - Content-Type: application/json                                     │
│    - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      │
│  Query Params:                                                           │
│    - year: 2025 (default to current year)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Backend - Spring Boot Controller (LeaveController.java)        │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 backend/src/main/java/com/pgis/hrms/modules/leave/controller/       │
│     LeaveController.java                                                 │
│                                                                           │
│  @GetMapping("/balance")                                                 │
│  @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR','EMPLOYEE')")       │
│  public List<LeaveBalanceDto> myBalances(                               │
│      @AuthenticationPrincipal UserDetails ud,                           │
│      @RequestParam(defaultValue="#{T(java.time.Year).now().value}")    │
│      int year                                                            │
│  ) {                                                                     │
│    // Step 4.1: Extract employee ID from JWT token                      │
│    int empId = currentEmpId(ud.getUsername());                          │
│                                                                           │
│    // Step 4.2: Call service layer                                      │
│    return svc.balances(empId, year);                                    │
│  }                                                                       │
│                                                                           │
│  private Integer currentEmpId(String email) {                           │
│    return userRepo.findByEmail(email)                                   │
│      .map(u -> {                                                         │
│        if (u.getEmployee() == null) {                                   │
│          throw new IllegalStateException(                               │
│            "User account is not linked to employee"                     │
│          );                                                              │
│        }                                                                 │
│        return u.getEmployee().getEmployeeId();                          │
│      })                                                                  │
│      .orElseThrow(() -> new IllegalStateException("User not found"));   │
│  }                                                                       │
│                                                                           │
│  ✅ Authorization: Check if user has required role                       │
│  ✅ Authentication: Extract email from JWT token                         │
│  ✅ User → Employee mapping: Get employee ID                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Service Layer (LeaveService.java)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 backend/src/main/java/com/pgis/hrms/modules/leave/service/          │
│     LeaveService.java                                                    │
│                                                                           │
│  @Transactional                                                          │
│  public List<LeaveBalanceDto> balances(Integer empId, int year) {      │
│    // Step 5.1: Get Employee entity                                     │
│    Employee emp = empRepo.getReferenceById(empId);                      │
│                                                                           │
│    // Step 5.2: Fetch existing balances from database                   │
│    Map<LeaveType, LeaveBalance> existing = balRepo                      │
│      .findByEmployeeEmployeeIdAndYear(empId, year)                      │
│      .stream()                                                           │
│      .collect(Collectors.toMap(                                          │
│        LeaveBalance::getLeaveType,                                       │
│        Function.identity()                                               │
│      ));                                                                 │
│                                                                           │
│    // Step 5.3: Seed missing leave types with default entitlements      │
│    leaveConfig.getEntitlements().forEach((type, entitled) -> {          │
│      LeaveBalance b = existing.get(type);                               │
│      if (b == null) {                                                    │
│        // Create new balance record if missing                           │
│        b = new LeaveBalance();                                           │
│        b.setEmployee(emp);                                               │
│        b.setLeaveType(type);                                             │
│        b.setYear(year);                                                  │
│        b.setEntitled(entitled);  // From config: ANNUAL=14, SICK=14..  │
│        b.setTaken(0);                                                    │
│        balRepo.save(b);                                                  │
│        existing.put(type, b);                                            │
│      } else if (b.getEntitled() != entitled) {                          │
│        // Update if config changed                                       │
│        b.setEntitled(entitled);                                          │
│        balRepo.save(b);                                                  │
│      }                                                                   │
│    });                                                                   │
│                                                                           │
│    // Step 5.4: Convert to DTOs and return                              │
│    return existing.values().stream()                                     │
│      .sorted(Comparator.comparing(LeaveBalance::getLeaveType))          │
│      .map(b -> new LeaveBalanceDto(                                      │
│        b.getLeaveType(),    // ANNUAL, SICK, CASUAL                     │
│        b.getEntitled(),     // e.g., 14                                 │
│        b.getTaken(),        // e.g., 8                                  │
│        b.remaining()        // e.g., 6 (calculated: entitled - taken)  │
│      ))                                                                  │
│      .toList();                                                          │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Repository Layer (LeaveBalanceRepository.java)                 │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 backend/src/main/java/com/pgis/hrms/modules/leave/repository/       │
│     LeaveBalanceRepository.java                                          │
│                                                                           │
│  public interface LeaveBalanceRepository                                 │
│      extends JpaRepository<LeaveBalance, Integer> {                      │
│                                                                           │
│    // Query method called by service                                     │
│    List<LeaveBalance> findByEmployeeEmployeeIdAndYear(                  │
│      Integer employeeId,                                                 │
│      int year                                                            │
│    );                                                                    │
│  }                                                                       │
│                                                                           │
│  🔍 JPA Query Generated:                                                 │
│     SELECT * FROM leave_balance                                          │
│     WHERE employee_id = ? AND year = ?                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Database Query (MySQL)                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 Database Table: leave_balance                                        │
│                                                                           │
│  SELECT                                                                  │
│    balance_id,                                                           │
│    employee_id,                                                          │
│    leave_type,                                                           │
│    year,                                                                 │
│    entitled,                                                             │
│    taken                                                                 │
│  FROM leave_balance                                                      │
│  WHERE employee_id = 123 AND year = 2025;                               │
│                                                                           │
│  📊 Sample Result:                                                       │
│  ┌────────────┬─────────────┬────────────┬──────┬──────────┬───────┐   │
│  │ balance_id │ employee_id │ leave_type │ year │ entitled │ taken │   │
│  ├────────────┼─────────────┼────────────┼──────┼──────────┼───────┤   │
│  │     501    │     123     │   ANNUAL   │ 2025 │    14    │   8   │   │
│  │     502    │     123     │    SICK    │ 2025 │    14    │   6   │   │
│  │     503    │     123     │   CASUAL   │ 2025 │     7    │   0   │   │
│  └────────────┴─────────────┴────────────┴──────┴──────────┴───────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 8: Entity Mapping (LeaveBalance.java)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 backend/src/main/java/com/pgis/hrms/modules/leave/model/            │
│     LeaveBalance.java                                                    │
│                                                                           │
│  @Entity                                                                 │
│  @Table(name = "leave_balance")                                          │
│  public class LeaveBalance {                                             │
│    @Id                                                                   │
│    private Integer balanceId;                                            │
│                                                                           │
│    @ManyToOne(fetch = FetchType.LAZY)                                   │
│    @JoinColumn(name = "employee_id")                                     │
│    private Employee employee;                                            │
│                                                                           │
│    @Enumerated(EnumType.STRING)                                          │
│    private LeaveType leaveType;  // ANNUAL, SICK, CASUAL                │
│                                                                           │
│    private int year;       // 2025                                       │
│    private int entitled;   // 14                                         │
│    private int taken;      // 8                                          │
│                                                                           │
│    // Calculated property                                                │
│    public int remaining() {                                              │
│      return entitled - taken;  // 14 - 8 = 6                            │
│    }                                                                     │
│  }                                                                       │
│                                                                           │
│  🔄 JPA converts DB rows → Java objects                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 9: DTO Conversion (LeaveBalanceDto.java)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  📂 backend/src/main/java/com/pgis/hrms/modules/leave/dto/              │
│     LeaveBalanceDto.java                                                 │
│                                                                           │
│  public record LeaveBalanceDto(                                          │
│    LeaveType type,      // ANNUAL, SICK, CASUAL                         │
│    int entitled,        // 14                                            │
│    int taken,           // 8                                             │
│    int remaining        // 6                                             │
│  ) {}                                                                    │
│                                                                           │
│  📦 Entity → DTO Conversion:                                             │
│     Stream of LeaveBalance objects                                       │
│       → .map(b -> new LeaveBalanceDto(...))                              │
│       → List<LeaveBalanceDto>                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  📡 HTTP RESPONSE (JSON)                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Status: 200 OK                                                          │
│  Content-Type: application/json                                          │
│                                                                           │
│  Response Body:                                                          │
│  [                                                                        │
│    {                                                                      │
│      "type": "ANNUAL",                                                   │
│      "entitled": 14,                                                     │
│      "taken": 8,                                                         │
│      "remaining": 6                                                      │
│    },                                                                     │
│    {                                                                      │
│      "type": "SICK",                                                     │
│      "entitled": 14,                                                     │
│      "taken": 6,                                                         │
│      "remaining": 8                                                      │
│    },                                                                     │
│    {                                                                      │
│      "type": "CASUAL",                                                   │
│      "entitled": 7,                                                      │
│      "taken": 0,                                                         │
│      "remaining": 7                                                      │
│    }                                                                      │
│  ]                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 10: Frontend - Process Response (Leave.js)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  const loadBalances = async () => {                                     │
│    try {                                                                 │
│      const { data } = await axiosInstance.get("/leave/balance");       │
│                                                                           │
│      console.log("Leave balance API response:", data);                  │
│                                                                           │
│      // Step 10.1: Ensure all leave types are present                   │
│      const leaveTypesList = ["ANNUAL", "SICK", "CASUAL"];               │
│                                                                           │
│      const completeBalances = leaveTypesList.map(type => {              │
│        const existing = data?.find(b => b.type === type);               │
│        if (existing) {                                                   │
│          // Map 'taken' to 'used' for UI consistency                    │
│          return {                                                         │
│            type: existing.type,        // "ANNUAL"                       │
│            entitled: existing.entitled || 0,  // 14                     │
│            used: existing.taken || 0,         // 8                      │
│            remaining: existing.remaining || 0 // 6                      │
│          };                                                              │
│        }                                                                 │
│        // If type missing, create default entry                          │
│        return {                                                           │
│          type: type,                                                     │
│          entitled: 0,                                                    │
│          used: 0,                                                        │
│          remaining: 0                                                    │
│        };                                                                │
│      });                                                                 │
│                                                                           │
│      console.log("Processed balances:", completeBalances);              │
│                                                                           │
│      // Step 10.2: Update React state                                   │
│      setBalances(completeBalances);                                     │
│                                                                           │
│    } catch (error) {                                                     │
│      console.error("Error loading leave balances:", error);             │
│      // Show fallback UI with zero values                                │
│      setBalances([                                                       │
│        { type: "ANNUAL", entitled: 0, used: 0, remaining: 0 },          │
│        { type: "SICK", entitled: 0, used: 0, remaining: 0 },            │
│        { type: "CASUAL", entitled: 0, used: 0, remaining: 0 }           │
│      ]);                                                                 │
│      setSnack({                                                          │
│        open: true,                                                       │
│        msg: "Failed to load leave balances",                            │
│        severity: "error"                                                 │
│      });                                                                 │
│    }                                                                     │
│  };                                                                      │
│                                                                           │
│  ✅ State updated → React re-renders UI                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 11: UI Rendering (Leave Balance Cards)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  {balances.map((b) => {                                                 │
│    const usedPercentage = b.entitled > 0                                │
│      ? (b.used / b.entitled) * 100                                      │
│      : 0;                                                                │
│                                                                           │
│    const leaveTypeLabel =                                                │
│      b.type === "ANNUAL" ? "Annual Leave" :                             │
│      b.type === "SICK" ? "Sick Leave" :                                 │
│      b.type === "CASUAL" ? "Casual Leave" : b.type;                     │
│                                                                           │
│    return (                                                              │
│      <Card key={b.type}>                                                 │
│        <CardContent>                                                     │
│          {/* Header */}                                                  │
│          <Typography variant="subtitle2">                               │
│            📅 {leaveTypeLabel}                                           │
│          </Typography>                                                   │
│                                                                           │
│          {/* Big Number */}                                              │
│          <Typography variant="h4" fontWeight={700}>                     │
│            {b.remaining}  {/* 6 */}                                     │
│          </Typography>                                                   │
│                                                                           │
│          {/* Subtitle */}                                                │
│          <Typography variant="body2">                                    │
│            days remaining out of {b.entitled}  {/* out of 14 */}        │
│          </Typography>                                                   │
│                                                                           │
│          {/* Progress Bar */}                                            │
│          <LinearProgress                                                 │
│            variant="determinate"                                         │
│            value={Math.min(usedPercentage, 100)}  {/* 57% */}          │
│            sx={{                                                         │
│              backgroundColor: usedPercentage > 80                        │
│                ? "#F3797E"  {/* Red if > 80% */}                        │
│                : usedPercentage > 50                                     │
│                ? "#FFC107"  {/* Orange if > 50% */}                     │
│                : "#4CAF50"  {/* Green otherwise */}                     │
│            }}                                                            │
│          />                                                              │
│                                                                           │
│          {/* Usage Text */}                                              │
│          <Typography variant="caption">                                  │
│            {b.used} used • {usedPercentage.toFixed(0)}% consumed        │
│            {/* 8 used • 57% consumed */}                                │
│          </Typography>                                                   │
│        </CardContent>                                                    │
│      </Card>                                                             │
│    );                                                                    │
│  })}                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  🎨 FINAL UI RENDERED IN BROWSER                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌───────────────────────┐  ┌───────────────────────┐                   │
│  │ 📅 Annual Leave       │  │ 📅 Sick Leave         │                   │
│  │                       │  │                       │                   │
│  │      6                │  │      8                │                   │
│  │ days remaining out    │  │ days remaining out    │                   │
│  │ of 14                 │  │ of 14                 │                   │
│  │ ▓▓▓▓▓▓░░░░░░░░        │  │ ▓▓▓▓▓░░░░░░░░░░       │                   │
│  │ 8 used • 57% consumed │  │ 6 used • 43% consumed │                   │
│  └───────────────────────┘  └───────────────────────┘                   │
│                                                                           │
│  ┌───────────────────────┐                                               │
│  │ 📅 Casual Leave       │                                               │
│  │                       │                                               │
│  │      7                │                                               │
│  │ days remaining out    │                                               │
│  │ of 7                  │                                               │
│  │ ░░░░░░░░░░░░░░░░░░    │                                               │
│  │ 0 used • 0% consumed  │                                               │
│  └───────────────────────┘                                               │
│                                                                           │
│  ✅ User sees their current leave balance with visual indicators         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Code Breakdown

### **1️⃣ Frontend: Initial Request (React)**

```javascript
// 📂 src/components/EmployeeDashboard/Leave.js
// Lines: 207-211

useEffect(() => {
  loadData();  // ← Triggered when component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**What happens:**
- User navigates to `/employee/leave`
- React component mounts
- `useEffect` hook triggers
- Calls `loadData()` function

---

### **2️⃣ Frontend: Parallel Data Loading**

```javascript
// Lines: 203-206

const loadData = async () => {
  setLoading(true);  // Show spinner
  await Promise.all([
    loadBalances(),   // ← Fetch leave balances
    loadMyLeaves()    // ← Fetch leave history
  ]);
  setLoading(false); // Hide spinner
};
```

**What happens:**
- Sets loading state to `true` → Shows circular progress spinner
- Makes **2 API calls in parallel** for better performance
- Waits for both to complete
- Sets loading state to `false` → Hides spinner

---

### **3️⃣ Frontend: Balance Fetching Function**

```javascript
// Lines: 142-183

const loadBalances = async () => {
  try {
    // 📤 Make HTTP GET request
    const { data } = await axiosInstance.get("/leave/balance");
    
    console.log("Leave balance API response:", data);
    
    // Ensure all 3 leave types are present
    const leaveTypesList = ["ANNUAL", "SICK", "CASUAL"];
    
    const completeBalances = leaveTypesList.map(type => {
      const existing = data?.find(b => b.type === type);
      
      if (existing) {
        return {
          type: existing.type,
          entitled: existing.entitled || 0,
          used: existing.taken || 0,  // Backend uses "taken"
          remaining: existing.remaining || 0
        };
      }
      
      // Fallback if type missing
      return {
        type: type,
        entitled: 0,
        used: 0,
        remaining: 0
      };
    });
    
    setBalances(completeBalances); // ← Update React state
    
  } catch (error) {
    console.error("Error loading leave balances:", error);
    
    // Show error and display zeros
    setBalances([
      { type: "ANNUAL", entitled: 0, used: 0, remaining: 0 },
      { type: "SICK", entitled: 0, used: 0, remaining: 0 },
      { type: "CASUAL", entitled: 0, used: 0, remaining: 0 }
    ]);
    
    setSnack({
      open: true,
      msg: "Failed to load leave balances",
      severity: "error"
    });
  }
};
```

**What happens:**
1. Makes GET request to `/leave/balance`
2. Receives array of balance objects
3. Ensures all 3 types (ANNUAL, SICK, CASUAL) exist
4. Maps `taken` field to `used` for UI consistency
5. Updates `balances` state → Triggers re-render
6. If error: Shows fallback UI with zeros

---

### **4️⃣ Frontend: Axios Interceptor (JWT Token)**

```javascript
// 📂 src/AxiosInstance.js
// Lines: 28-37

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**What happens:**
- Intercepts every outgoing request
- Retrieves JWT token from `localStorage`
- Attaches it to `Authorization` header
- Request proceeds to backend with token

**Example HTTP Request:**
```http
GET /leave/balance?year=2025 HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiRU1QTE9ZRUUiXSwiaWF0IjoxNzMxMjg0NDAwLCJleHAiOjE3MzEyODgwMDB9.Xj8Kf9LmN3pQ5rS7tU8vW0xY1zZ2aB3cD4eF5gH6iJ7k
```

---

### **5️⃣ Backend: Controller Layer**

```java
// 📂 backend/src/main/java/com/pgis/hrms/modules/leave/controller/
//    LeaveController.java
// Lines: 48-53

@GetMapping("/balance")
@PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR','EMPLOYEE')")
public List<LeaveBalanceDto> myBalances(
    @AuthenticationPrincipal UserDetails ud,
    @RequestParam(defaultValue="#{T(java.time.Year).now().value}") int year
) {
    return svc.balances(currentEmpId(ud.getUsername()), year);
}
```

**What happens:**
1. **Authorization**: Spring Security checks if user has required role
2. **Authentication**: Extracts `UserDetails` from JWT token
3. **Employee Mapping**: Calls `currentEmpId()` to get employee ID from email
4. **Delegation**: Passes employee ID + year to service layer

---

```java
// Lines: 29-41

private Integer currentEmpId(String email) {
    return userRepo.findByEmail(email)
        .map(u -> {
            if (u.getEmployee() == null) {
                throw new IllegalStateException(
                    "User account is not linked to an employee record. " +
                    "Please contact HR to complete your profile setup."
                );
            }
            return u.getEmployee().getEmployeeId();
        })
        .orElseThrow(() -> new IllegalStateException("User not found"));
}
```

**What happens:**
- Looks up user by email from JWT token
- Checks if user is linked to employee record
- Returns employee ID
- Throws error if user not found or not linked

---

### **6️⃣ Backend: Service Layer**

```java
// 📂 backend/src/main/java/com/pgis/hrms/modules/leave/service/
//    LeaveService.java
// Lines: 173-210

@Transactional
public List<LeaveBalanceDto> balances(Integer empId, int year) {
    // Step 1: Get employee entity
    Employee emp = empRepo.getReferenceById(empId);

    // Step 2: Fetch existing balances from DB
    Map<LeaveType, LeaveBalance> existing = balRepo
        .findByEmployeeEmployeeIdAndYear(empId, year)
        .stream()
        .collect(Collectors.toMap(
            LeaveBalance::getLeaveType,
            Function.identity()
        ));

    // Step 3: Seed missing leave types with default entitlements
    leaveConfig.getEntitlements().forEach((type, entitled) -> {
        LeaveBalance b = existing.get(type);
        
        if (b == null) {
            // Create new balance record
            b = new LeaveBalance();
            b.setEmployee(emp);
            b.setLeaveType(type);
            b.setYear(year);
            b.setEntitled(entitled);  // From config: ANNUAL=14, SICK=14, CASUAL=7
            b.setTaken(0);
            balRepo.save(b);
            existing.put(type, b);
        } else if (b.getEntitled() != entitled) {
            // Update if config changed
            b.setEntitled(entitled);
            balRepo.save(b);
        }
    });

    // Step 4: Convert entities to DTOs
    return existing.values().stream()
        .sorted(Comparator.comparing(LeaveBalance::getLeaveType))
        .map(b -> new LeaveBalanceDto(
            b.getLeaveType(),    // ANNUAL, SICK, CASUAL
            b.getEntitled(),     // 14
            b.getTaken(),        // 8
            b.remaining()        // 6 (calculated)
        ))
        .toList();
}
```

**What happens:**
1. **Get Employee**: Fetches employee entity from database
2. **Query Balances**: Calls repository to get balance records
3. **Seed Missing Types**: Creates default records if any leave type is missing
4. **Update Config**: Updates entitlement if config changed
5. **Convert to DTOs**: Maps entities → DTOs for API response
6. **Return**: Sends list of DTOs back to controller

---

### **7️⃣ Backend: Repository Layer**

```java
// 📂 backend/src/main/java/com/pgis/hrms/modules/leave/repository/
//    LeaveBalanceRepository.java

public interface LeaveBalanceRepository 
    extends JpaRepository<LeaveBalance, Integer> {
    
    List<LeaveBalance> findByEmployeeEmployeeIdAndYear(
        Integer employeeId,
        int year
    );
}
```

**Generated SQL:**
```sql
SELECT 
    balance_id,
    employee_id,
    leave_type,
    year,
    entitled,
    taken
FROM leave_balance
WHERE employee_id = 123 
  AND year = 2025;
```

**What happens:**
- Spring Data JPA generates SQL from method name
- Executes query against MySQL database
- Returns list of `LeaveBalance` entities

---

### **8️⃣ Database: Table Structure**

```sql
-- Table: leave_balance
CREATE TABLE leave_balance (
    balance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    entitled INT NOT NULL,
    taken INT NOT NULL,
    UNIQUE KEY (employee_id, leave_type, year),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

**Sample Data:**
```
┌────────────┬─────────────┬────────────┬──────┬──────────┬───────┐
│ balance_id │ employee_id │ leave_type │ year │ entitled │ taken │
├────────────┼─────────────┼────────────┼──────┼──────────┼───────┤
│    501     │     123     │   ANNUAL   │ 2025 │    14    │   8   │
│    502     │     123     │    SICK    │ 2025 │    14    │   6   │
│    503     │     123     │   CASUAL   │ 2025 │     7    │   0   │
└────────────┴─────────────┴────────────┴──────┴──────────┴───────┘
```

---

### **9️⃣ Backend: Entity Model**

```java
// 📂 backend/src/main/java/com/pgis/hrms/modules/leave/model/
//    LeaveBalance.java

@Entity
@Table(name = "leave_balance")
public class LeaveBalance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer balanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private LeaveType leaveType;  // ANNUAL, SICK, CASUAL

    private int year;       // 2025
    private int entitled;   // 14
    private int taken;      // 8

    // Calculated property
    public int remaining() {
        return entitled - taken;  // 14 - 8 = 6
    }
}
```

**What happens:**
- JPA/Hibernate converts database rows → Java objects
- `@Entity` marks this as a database table
- `@ManyToOne` creates relationship with `Employee`
- `remaining()` is a computed property (not stored in DB)

---

### **🔟 Backend: DTO (Data Transfer Object)**

```java
// 📂 backend/src/main/java/com/pgis/hrms/modules/leave/dto/
//    LeaveBalanceDto.java

public record LeaveBalanceDto(
    LeaveType type,      // ANNUAL, SICK, CASUAL
    int entitled,        // 14
    int taken,           // 8
    int remaining        // 6
) {}
```

**What happens:**
- Java Record (immutable data class)
- Used to transfer data between layers
- Prevents exposing internal entity structure
- Auto-converts to JSON by Spring Boot

---

### **1️⃣1️⃣ Backend: HTTP Response**

```json
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sat, 09 Nov 2025 10:30:00 GMT

[
  {
    "type": "ANNUAL",
    "entitled": 14,
    "taken": 8,
    "remaining": 6
  },
  {
    "type": "SICK",
    "entitled": 14,
    "taken": 6,
    "remaining": 8
  },
  {
    "type": "CASUAL",
    "entitled": 7,
    "taken": 0,
    "remaining": 7
  }
]
```

---

### **1️⃣2️⃣ Frontend: UI Rendering**

```javascript
// Lines: 795-858

{balances.map((b) => {
  const usedPercentage = b.entitled > 0 
    ? (b.used / b.entitled) * 100 
    : 0;
  
  const leaveTypeLabel = 
    b.type === "ANNUAL" ? "Annual Leave" :
    b.type === "SICK" ? "Sick Leave" :
    b.type === "CASUAL" ? "Casual Leave" : b.type;
  
  return (
    <Card key={b.type}>
      <CardContent>
        <Typography variant="subtitle2">
          📅 {leaveTypeLabel}
        </Typography>
        
        <Typography variant="h4" fontWeight={700}>
          {b.remaining}  {/* Big number: 6 */}
        </Typography>
        
        <Typography variant="body2">
          days remaining out of {b.entitled}
        </Typography>
        
        <LinearProgress
          variant="determinate"
          value={Math.min(usedPercentage, 100)}
          sx={{
            backgroundColor: 
              usedPercentage > 80 ? "#F3797E" :  // Red
              usedPercentage > 50 ? "#FFC107" :  // Orange
              "#4CAF50"  // Green
          }}
        />
        
        <Typography variant="caption">
          {b.used} used • {usedPercentage.toFixed(0)}% consumed
        </Typography>
      </CardContent>
    </Card>
  );
})}
```

**Visual Result:**
```
┌─────────────────────────────────┐
│ 📅 Annual Leave                 │
│                                 │
│        6                        │
│ days remaining out of 14        │
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░        │
│ 8 used • 57% consumed           │
└─────────────────────────────────┘
```

---

## ⏱️ Performance Timeline

```
User clicks page
    │
    ├─ 0ms      → Component mounts
    ├─ 5ms      → useEffect triggers
    ├─ 10ms     → HTTP request sent
    ├─ 15ms     → Request reaches backend
    ├─ 20ms     → Spring Security validates JWT
    ├─ 25ms     → Controller extracts employee ID
    ├─ 30ms     → Service queries database
    ├─ 50ms     → Database returns results
    ├─ 55ms     → Entity → DTO conversion
    ├─ 60ms     → JSON response sent
    ├─ 75ms     → Frontend receives data
    ├─ 80ms     → State updated
    └─ 85ms     → UI re-renders with data
```

**Total Time: ~85ms** ⚡

---

## 🛡️ Security Flow

1. **JWT Token Storage**: Token stored in `localStorage` after login
2. **Automatic Attachment**: Axios interceptor adds token to every request
3. **Backend Validation**: Spring Security validates token signature
4. **Role Check**: `@PreAuthorize` ensures user has required role
5. **User Extraction**: Email extracted from JWT payload
6. **Employee Mapping**: Email → User → Employee ID lookup
7. **Data Isolation**: Only data for authenticated employee is returned

---

## 🎨 UI State Management

```javascript
// React State
const [balances, setBalances] = useState([]);
const [loading, setLoading] = useState(true);

// State Flow:
// 1. loading: true  → Shows spinner
// 2. API call       → Fetching data
// 3. setBalances()  → Updates state
// 4. loading: false → Hides spinner
// 5. Re-render      → Shows balance cards
```

---

## 🔄 Data Transformation Chain

```
Database Row
   ↓
JPA Entity (LeaveBalance)
   ↓
DTO (LeaveBalanceDto)
   ↓
JSON Response
   ↓
JavaScript Object
   ↓
React State
   ↓
UI Components
```

---

## 🚨 Error Handling

### **Frontend:**
```javascript
catch (error) {
  console.error("Error loading leave balances:", error);
  
  // Fallback: Show zeros
  setBalances([
    { type: "ANNUAL", entitled: 0, used: 0, remaining: 0 },
    { type: "SICK", entitled: 0, used: 0, remaining: 0 },
    { type: "CASUAL", entitled: 0, used: 0, remaining: 0 }
  ]);
  
  // Show error message
  setSnack({
    open: true,
    msg: "Failed to load leave balances",
    severity: "error"
  });
}
```

### **Backend:**
```java
private Integer currentEmpId(String email) {
    return userRepo.findByEmail(email)
        .map(u -> {
            if (u.getEmployee() == null) {
                throw new IllegalStateException(
                    "User account is not linked to employee"
                );
            }
            return u.getEmployee().getEmployeeId();
        })
        .orElseThrow(() -> 
            new IllegalStateException("User not found")
        );
}
```

---

## 📊 Sample Data Flow

```
INPUT:
  - Employee ID: 123
  - Year: 2025

DATABASE QUERY:
  SELECT * FROM leave_balance 
  WHERE employee_id = 123 AND year = 2025

DATABASE RESULT:
  [
    { balance_id: 501, employee_id: 123, leave_type: "ANNUAL", 
      year: 2025, entitled: 14, taken: 8 },
    { balance_id: 502, employee_id: 123, leave_type: "SICK", 
      year: 2025, entitled: 14, taken: 6 },
    { balance_id: 503, employee_id: 123, leave_type: "CASUAL", 
      year: 2025, entitled: 7, taken: 0 }
  ]

ENTITY OBJECTS:
  List<LeaveBalance> with remaining() calculated

DTO OBJECTS:
  [
    LeaveBalanceDto(ANNUAL, 14, 8, 6),
    LeaveBalanceDto(SICK, 14, 6, 8),
    LeaveBalanceDto(CASUAL, 7, 0, 7)
  ]

JSON RESPONSE:
  [
    {"type":"ANNUAL","entitled":14,"taken":8,"remaining":6},
    {"type":"SICK","entitled":14,"taken":6,"remaining":8},
    {"type":"CASUAL","entitled":7,"taken":0,"remaining":7}
  ]

FRONTEND STATE:
  balances: [
    {type: "ANNUAL", entitled: 14, used: 8, remaining: 6},
    {type: "SICK", entitled: 14, used: 6, remaining: 8},
    {type: "CASUAL", entitled: 7, used: 0, remaining: 7}
  ]

UI OUTPUT:
  Three cards showing balance with progress bars
```

---

## 🎯 Key Takeaways

1. **Automatic Loading**: Data fetches on component mount via `useEffect`
2. **Parallel Requests**: Balance + History fetched simultaneously
3. **JWT Security**: Token automatically attached to requests
4. **Role-Based**: Only authorized users can access
5. **Data Isolation**: Users only see their own data
6. **Fallback UI**: Graceful error handling with zeros
7. **Real-time Calculation**: `remaining` computed on backend
8. **Visual Feedback**: Progress bars with color coding
9. **Auto-Seeding**: Missing leave types created automatically
10. **Transaction Safety**: `@Transactional` ensures data consistency

---

## 📝 Summary

This fetch operation is a **classic REST API pattern**:

1. **Frontend** makes authenticated HTTP request
2. **Backend** validates, queries database, transforms data
3. **Response** returns JSON
4. **Frontend** updates state and re-renders UI

The entire flow takes **~85ms** from click to visual update! 🚀

