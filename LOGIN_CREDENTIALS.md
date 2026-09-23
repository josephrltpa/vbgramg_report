# Village Login Credentials

## Admin (Computer Assistant)
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Can view and manage all villages

---

## VEC Secretaries (Village-Level Access)

All village secretaries use the same password: **`vec123`**

### Thingsulthliah Block (Aizawl District)

| Village | Username | Password |
|---------|----------|----------|
| Darlawng | `darlawng` | `vec123` |
| Phulmawi | `phulmawi` | `vec123` |
| Seling | `seling` | `vec123` |
| Sesawng I | `sesawng1` | `vec123` |
| Sesawng II | `sesawng2` | `vec123` |
| Sesawng III | `sesawng3` | `vec123` |
| Thingsulthliah - I | `thingsulthliah1` | `vec123` |
| Thingsulthliah II | `thingsulthliah2` | `vec123` |
| Tlangnuam | `tlangnuam` | `vec123` |
| Tlungvel | `tlungvel` | `vec123` |

### Phullen Block (Saitual District)

| Village | Username | Password |
|---------|----------|----------|
| Buhban | `buhban` | `vec123` |
| Dilkhan | `dilkhan` | `vec123` |
| Keifang Leitan | `keifangleitan` | `vec123` |
| Keifang Venghlun | `keifangvenghlun` | `vec123` |
| Keifang Venglai | `keifangvenglai` | `vec123` |
| Khanpui | `khanpui` | `vec123` |
| Lailak | `lailak` | `vec123` |
| Lenchim | `lenchim` | `vec123` |
| Lungpher | `lungpher` | `vec123` |
| Maite | `maite` | `vec123` |
| Mualpheng | `mualpheng` | `vec123` |
| Ruallung | `ruallung` | `vec123` |
| Rulchawm | `rulchawm` | `vec123` |
| Saitual Venglai | `saitualvenglai` | `vec123` |
| Saitual-I | `saitual1` | `vec123` |
| Saitual-III | `saitual3` | `vec123` |
| Sihfa | `sihfa` | `vec123` |
| Tawizo | `tawizo` | `vec123` |
| Tualbung | `tualbung` | `vec123` |

---

## How It Works

1. **Admin Login:**
   - Logs in with `admin` / `admin123`
   - Can see all villages
   - Can use the location selector to filter by District → Block → Village
   - Can add/edit/delete job cards and demands for any village

2. **VEC Secretary Login:**
   - Logs in with their village username (e.g., `buhban`) and password `vec123`
   - Can only see data for their assigned village
   - Can add job card requests for their village
   - Can view and manage demands for their village

3. **Data Isolation:**
   - Each secretary only sees their village's data
   - Admin can see and manage all villages
   - Data is filtered automatically based on the logged-in user's village

---

## Testing the System

### Test as Buhban Secretary:
1. Login: `buhban` / `vec123`
2. You should only see job cards and demands for Buhban village
3. Try adding a new job card request
4. Check the Demands tab

### Test as Admin:
1. Login: `admin` / `admin123`
2. Use the location selector to choose a village
3. You can see and manage data for any village
4. Try approving a job card request from a village

---

## Notes

- Usernames are the village names in lowercase (without spaces or special characters)
- All village secretaries use the same password (`vec123`) for simplicity
- The admin account has full access to all villages
- Village secretaries are restricted to their own village's data only
