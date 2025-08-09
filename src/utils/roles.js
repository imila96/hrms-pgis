export const ROLE = {
  ADMIN: "ROLE_ADMIN",
  HR: "ROLE_HR",
  DIRECTOR: "ROLE_DIRECTOR",
  EMPLOYEE: "ROLE_EMPLOYEE",
};

export const roleHome = {
  [ROLE.ADMIN]: "/admin",
  [ROLE.HR]: "/hr",
  [ROLE.DIRECTOR]: "/director",
  [ROLE.EMPLOYEE]: "/employee",
};

export const roleLabel = (r) =>
  r === ROLE.ADMIN ? "Admin" :
  r === ROLE.HR ? "HR" :
  r === ROLE.DIRECTOR ? "Director" :
  r === ROLE.EMPLOYEE ? "Employee" : r;
