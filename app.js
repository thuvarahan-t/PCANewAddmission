// ==============================
// PHYSICS CUBE ACADEMY - BACKEND (BUGFIX: Count Report, Last Reg IDs, No Join Year)
// ==============================

const CONFIG = {
  SPREADSHEET_ID: '1QjVx1DxNgimmYMm0CuQOmMrey21sa6v4_03pcVJJ7O8',
  SHEETS: {
    STUDENTS: 'Students',
    DISTRICTS: 'Districts',
    BATCHES: 'Batches',
    ADMINS: 'Admins'
  },
  ADMIN_CREDENTIALS: {
    username: 'PCAadmin',
    password: 'PCA@1369'
  }
};

function doPost(e) {
  try {
    if (!e || !e.parameter || !e.parameter.function) {
      return corsResponse({ success: false, message: 'Invalid request: No function provided.' });
    }
    const functionName = e.parameter.function;
    const parameters = e.parameter.parameters ? JSON.parse(e.parameter.parameters) : {};

    let result;
    switch (functionName) {
      case 'authenticate': result = authenticate(parameters); break;
      case 'getDistricts': result = getDistricts(); break;
      case 'getBatches': result = getBatches(); break;
      case 'getStudents': result = getStudents(); break;
      case 'getLastRegistrationIds': result = getLastRegistrationIds(); break;
      case 'addStudent': result = addStudent(parameters); break;
      case 'addDistrict': result = addDistrict(parameters); break;
      case 'addBatch': result = addBatch(parameters); break;
      case 'deleteDistrict': result = deleteDistrict(parameters); break;
      case 'deleteBatch': result = deleteBatch(parameters); break;
      case 'searchStudent': result = searchStudent(parameters); break;
      case 'updateStudent': result = updateStudent(parameters); break;
      case 'deleteStudent': result = deleteStudent(parameters); break;
      case 'getDateReport': result = getDateReport(parameters); break;
      case 'getCountReport': result = getCountReport(parameters); break;
      case 'getDailyAnalytics': result = getDailyAnalytics(parameters); break;
      case 'testConnection': result = testConnection(); break;
      case 'initializeSpreadsheet': result = initializeSpreadsheet(); break;
      default: result = { success: false, message: 'Function not found: ' + functionName };
    }
    return corsResponse(result);
  } catch (error) {
    return corsResponse({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}

function doGet(e) {
  return corsResponse({
    success: true,
    message: 'Physics Cube Academy API is running',
    timestamp: new Date().toISOString()
  });
}
function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}
function corsResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}
function getSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    setupSheetHeaders(sheet, sheetName);
  }
  return sheet;
}
function setupSheetHeaders(sheet, sheetName) {
  let headers = [];
  switch (sheetName) {
    case CONFIG.SHEETS.STUDENTS:
      headers = ['Registration ID', 'Name', 'District', 'Batch', 'Join Date', 'Added By', 'Added At', 'Updated At'];
      break;
    case CONFIG.SHEETS.DISTRICTS:
      headers = ['District', 'Added At'];
      break;
    case CONFIG.SHEETS.BATCHES:
      headers = ['Batch', 'Added At'];
      break;
    case CONFIG.SHEETS.ADMINS:
      headers = ['Username', 'Password', 'Created At'];
      break;
    default: return;
  }
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
    sheet.setFrozenRows(1);
  }
}
function generateRegistrationId(batch) {
  const studentsSheet = getSheet(CONFIG.SHEETS.STUDENTS);
  const data = studentsSheet.getDataRange().getValues();
  const batchPrefix = batch.replace(/\sProper/g, 'P').replace(/\sRepeat/g, 'R').replace(/\s/g, '').toUpperCase();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const regId = data[i][0];
    const studentBatch = data[i][3];
    if (regId && studentBatch && studentBatch.toLowerCase() === batch.toLowerCase() && regId.startsWith(batchPrefix + '-')) {
      const idNumber = parseInt(regId.split('-')[1]);
      if (!isNaN(idNumber) && idNumber > maxId) {
        maxId = idNumber;
      }
    }
  }
  const newId = maxId + 1;
  return `${batchPrefix}-${newId.toString().padStart(3, '0')}`;
}
function validateRequired(data, fields) {
  const missing = [];
  fields.forEach(field => {
    if (data[field] === null || data[field] === undefined || String(data[field]).trim() === '') {
      missing.push(field);
    }
  });
  return missing;
}
function authenticate(params) {
  try {
    const { username, password } = params;
    if (!username || !password) return { success: false, message: 'Username and password are required' };
    if (username === CONFIG.ADMIN_CREDENTIALS.username && password === CONFIG.ADMIN_CREDENTIALS.password) {
      return { success: true, message: 'Authentication successful' };
    }
    const adminsSheet = getSheet(CONFIG.SHEETS.ADMINS);
    const data = adminsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === username && data[i][1] === password) {
        return { success: true, message: 'Authentication successful' };
      }
    }
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    return { success: false, message: 'Authentication failed due to server error: ' + error.message };
  }
}

// Only add defaults if the sheet is brand new (header only).
function getDistricts() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.DISTRICTS);
    const data = sheet.getDataRange().getValues();
    // Only add defaults if sheet has just header row or first row is blank
    if (data.length === 1 && (!data[0][0] || data[0][0] === 'District')) {
      const defaultDistricts = [];
      defaultDistricts.forEach(district => {
        sheet.appendRow([district, new Date()]);
      });
    }
    // Re-fetch data after possible addition
    const updatedData = sheet.getDataRange().getValues();
    const districts = updatedData.slice(1).map(row => row[0]).filter(Boolean).sort();
    return { success: true, data: districts };
  } catch (error) {
    return { success: false, message: 'Failed to retrieve districts: ' + error.message };
  }
}

function addDistrict(params) {
  try {
    const { district } = params;
    if (!district || String(district).trim() === '') {
      return { success: false, message: 'District name is required' };
    }
    const sheet = getSheet(CONFIG.SHEETS.DISTRICTS);
    const data = sheet.getDataRange().getValues();
    const newDistrictName = String(district).trim();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && String(data[i][0]).toLowerCase() === newDistrictName.toLowerCase()) {
        return { success: false, message: 'District already exists' };
      }
    }
    sheet.appendRow([newDistrictName, new Date()]);
    return { success: true, message: 'District added successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to add district: ' + error.message };
  }
}
function deleteDistrict(params) {
  try {
    const { district } = params;
    if (!district || String(district).trim() === '') {
      return { success: false, message: 'District name is required' };
    }
    const sheet = getSheet(CONFIG.SHEETS.DISTRICTS);
    const data = sheet.getDataRange().getValues();
    const districtToDelete = String(district).trim();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && String(data[i][0]).toLowerCase() === districtToDelete.toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'District deleted successfully' };
      }
    }
    return { success: false, message: 'District not found' };
  } catch (error) {
    return { success: false, message: 'Failed to delete district: ' + error.message };
  }
}

// Only add defaults if the sheet is brand new (header only).
function getBatches() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.BATCHES);
    const data = sheet.getDataRange().getValues();
    if (data.length === 1 && (!data[0][0] || data[0][0] === 'Batch')) {
      const defaultBatches = [];
      defaultBatches.forEach(batch => {
        sheet.appendRow([batch, new Date()]);
      });
    }
    const updatedData = sheet.getDataRange().getValues();
    const batches = updatedData.slice(1).map(row => row[0]).filter(Boolean).sort();
    return { success: true, data: batches };
  } catch (error) {
    return { success: false, message: 'Failed to retrieve batches: ' + error.message };
  }
}

function addBatch(params) {
  try {
    const { batch } = params;
    if (!batch || String(batch).trim() === '') {
      return { success: false, message: 'Batch name is required' };
    }
    const sheet = getSheet(CONFIG.SHEETS.BATCHES);
    const data = sheet.getDataRange().getValues();
    const newBatchName = String(batch).trim();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && String(data[i][0]).toLowerCase() === newBatchName.toLowerCase()) {
        return { success: false, message: 'Batch already exists' };
      }
    }
    sheet.appendRow([newBatchName, new Date()]);
    return { success: true, message: 'Batch added successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to add batch: ' + error.message };
  }
}
function deleteBatch(params) {
  try {
    const { batch } = params;
    if (!batch || String(batch).trim() === '') {
      return { success: false, message: 'Batch name is required' };
    }
    const sheet = getSheet(CONFIG.SHEETS.BATCHES);
    const data = sheet.getDataRange().getValues();
    const batchToDelete = String(batch).trim();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && String(data[i][0]).toLowerCase() === batchToDelete.toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Batch deleted successfully' };
      }
    }
    return { success: false, message: 'Batch not found' };
  } catch (error) {
    return { success: false, message: 'Failed to delete batch: ' + error.message };
  }
}
function getStudents() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, data: [] };
    }
    const headers = data[0].map(header => {
      const key = header.replace(/\s/g, '');
      return key.charAt(0).toLowerCase() + key.slice(1);
    });
    const students = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        const student = {};
        headers.forEach((headerKey, index) => {
          let value = row[index];
          if (value instanceof Date) {
            value = value.toISOString().split('T')[0];
          }
          student[headerKey] = value;
        });
        student.registrationId = row[0];
        students.push(student);
      }
    }
    return { success: true, data: students };
  } catch (error) {
    return { success: false, message: 'Failed to retrieve student data: ' + error.message };
  }
}

// FIX: Only show valid admin usernames (not dates or numbers)
function getCountReport(params) {
  try {
    const { startDate, endDate, batch } = params;
    if (!startDate || !endDate) {
      return { success: false, message: 'Start date and end date are required for count report' };
    }
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    let validAdmins = {};
    try {
      const adminsSheet = getSheet(CONFIG.SHEETS.ADMINS);
      const adminsData = adminsSheet.getDataRange().getValues();
      for (let i = 1; i < adminsData.length; i++) {
        if (adminsData[i][0] && typeof adminsData[i][0] === "string") {
          validAdmins[adminsData[i][0]] = true;
        }
      }
      validAdmins[CONFIG.ADMIN_CREDENTIALS.username] = true;
    } catch (err) {}
    const registrationsByAdmin = {};
    const registrationsByBatch = {};
    let totalRegistrations = 0;
    const startDateTime = new Date(startDate + 'T00:00:00Z');
    const endDateTime = new Date(endDate + 'T23:59:59Z');
    for (let i = 1; i < data.length; i++) {
      const joinDateValue = data[i][4];
      const studentBatch = data[i][3];
      const addedBy = data[i][5];
      let studentJoinDate;
      if (joinDateValue instanceof Date) {
        studentJoinDate = new Date(Utilities.formatDate(joinDateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd') + 'T00:00:00Z');
      } else {
        studentJoinDate = new Date(String(joinDateValue).split('T')[0] + 'T00:00:00Z');
      }
      if (studentJoinDate.getTime() >= startDateTime.getTime() && studentJoinDate.getTime() <= endDateTime.getTime()) {
        if (!batch || studentBatch === batch) {
          totalRegistrations++;
          if (addedBy && validAdmins[addedBy]) {
            registrationsByAdmin[addedBy] = (registrationsByAdmin[addedBy] || 0) + 1;
          }
          if (studentBatch) {
            registrationsByBatch[studentBatch] = (registrationsByBatch[studentBatch] || 0) + 1;
          }
        }
      }
    }
    return { 
      success: true, 
      data: { 
        registrationsByAdmin, 
        registrationsByBatch, 
        totalRegistrations 
      } 
    };
  } catch (error) {
    return { success: false, message: 'Failed to generate count report: ' + error.message };
  }
}

// FIX: Always highest numeric regId per batch
function getLastRegistrationIds() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    const lastIds = {};
    for (let i = 1; i < data.length; i++) {
      const regId = data[i][0];
      const batch = data[i][3];
      if (regId && batch) {
        if (!lastIds[batch]) {
          lastIds[batch] = regId;
        } else {
          const curIdNum = parseInt(regId.replace(/[^0-9]/g, '')) || 0;
          const lastIdNum = parseInt(lastIds[batch].replace(/[^0-9]/g, '')) || 0;
          if (curIdNum > lastIdNum) {
            lastIds[batch] = regId;
          }
        }
      }
    }
    return { success: true, data: lastIds };
  } catch (error) {
    return { success: false, message: 'Failed to retrieve last registration IDs: ' + error.message };
  }
}

function addStudent(params) {
  try {
    const { registrationId, name, district, batch, joinDate, addedBy } = params;
    const missing = validateRequired(params, ['name', 'district', 'batch', 'joinDate', 'addedBy']);
    if (missing.length > 0) {
      return { success: false, message: `Missing required fields: ${missing.join(', ')}` };
    }
    let regId = registrationId && String(registrationId).trim() !== ''
      ? String(registrationId).trim()
      : generateRegistrationId(batch);
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const now = new Date();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === regId.toLowerCase()) {
        return { success: false, message: 'Registration ID already exists' };
      }
    }
    sheet.appendRow([
      regId,
      String(name).trim(),
      district,
      batch,
      joinDate,
      addedBy,
      now,
      now
    ]);
    return { 
      success: true, 
      message: 'Student registered successfully',
      registrationId: regId
    };
  } catch (error) {
    return { success: false, message: 'Failed to register student: ' + error.message };
  }
}
function searchStudent(params) {
  try {
    const { registrationId } = params;
    if (!registrationId || String(registrationId).trim() === '') {
      return { success: false, message: 'Registration ID is required' };
    }
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(header => {
      const key = header.replace(/\s/g, '');
      return key.charAt(0).toLowerCase() + key.slice(1);
    });
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(registrationId).trim().toLowerCase()) {
        const student = {};
        headers.forEach((headerKey, index) => {
          let value = data[i][index];
          if (value instanceof Date) {
            value = value.toISOString().split('T')[0];
          }
          student[headerKey] = value;
        });
        student.registrationId = data[i][0];
        student.rowNumber = i + 1;
        return { success: true, data: student };
      }
    }
    return { success: false, message: 'Student not found' };
  } catch (error) {
    return { success: false, message: 'Failed to search student: ' + error.message };
  }
}

// FIX: Don't change Added By on update
function updateStudent(params) {
  try {
    const { registrationId, name, district, batch, joinDate, updatedBy } = params;
    const missing = validateRequired(params, ['registrationId', 'name', 'district', 'batch', 'joinDate', 'updatedBy']);
    if (missing.length > 0) {
      return { success: false, message: `Missing required fields for update: ${missing.join(', ')}` };
    }
    if (!registrationId || String(registrationId).trim() === '') {
      return { success: false, message: 'Registration ID is required for update' };
    }
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(registrationId).trim().toLowerCase()) {
        const rowNum = i + 1;
        sheet.getRange(rowNum, 2).setValue(String(name).trim());
        sheet.getRange(rowNum, 3).setValue(district);
        sheet.getRange(rowNum, 4).setValue(batch);
        sheet.getRange(rowNum, 5).setValue(joinDate);
        // Don't touch Added By (col 6)
        sheet.getRange(rowNum, 8).setValue(new Date());
        return { success: true, message: `Student ${registrationId} updated successfully` };
      }
    }
    return { success: false, message: 'Student not found for update' };
  } catch (error) {
    return { success: false, message: 'Failed to update student: ' + error.message };
  }
}
function deleteStudent(params) {
  try {
    const { registrationId } = params;
    if (!registrationId || String(registrationId).trim() === '') {
      return { success: false, message: 'Registration ID is required for deletion' };
    }
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(registrationId).trim().toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: `Student ${registrationId} deleted successfully` };
      }
    }
    return { success: false, message: 'Student not found for deletion' };
  } catch (error) {
    return { success: false, message: 'Failed to delete student: ' + error.message };
  }
}
function getDateReport(params) {
  try {
    const { date } = params;
    if (!date) {
      return { success: false, message: 'Date is required for the report' };
    }
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(header => {
      const key = header.replace(/\s/g, '');
      return key.charAt(0).toLowerCase() + key.slice(1);
    });
    const students = [];
    for (let i = 1; i < data.length; i++) {
      const joinDateValue = data[i][4];
      let formattedJoinDate;
      if (joinDateValue instanceof Date) {
        formattedJoinDate = Utilities.formatDate(joinDateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        formattedJoinDate = String(joinDateValue).split('T')[0];
      }
      if (formattedJoinDate === date) {
        const student = {};
        headers.forEach((headerKey, index) => {
          let value = data[i][index];
          if (value instanceof Date) {
            value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          }
          student[headerKey] = value;
        });
        student.registrationId = data[i][0];
        students.push(student);
      }
    }
    return { success: true, data: students };
  } catch (error) {
    return { success: false, message: 'Failed to generate date report: ' + error.message };
  }
}
function getDailyAnalytics(params) {
  try {
    const { startDate, endDate } = params;
    if (!startDate || !endDate) {
      return { success: false, message: 'Start date and end date are required for daily analytics' };
    }
    const sheet = getSheet(CONFIG.SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    const dailyCounts = {};
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');
    for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
      const dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      dailyCounts[dateStr] = 0;
    }
    for (let i = 1; i < data.length; i++) {
      const joinDateValue = data[i][4];
      let formattedJoinDate;
      if (joinDateValue instanceof Date) {
        formattedJoinDate = Utilities.formatDate(joinDateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        formattedJoinDate = String(joinDateValue).split('T')[0];
      }
      if (dailyCounts.hasOwnProperty(formattedJoinDate)) {
        dailyCounts[formattedJoinDate]++;
      }
    }
    const resultData = Object.keys(dailyCounts).sort().map(date => ({
      date: date,
      registrations: dailyCounts[date]
    }));
    return { success: true, data: resultData };
  } catch (error) {
    return { success: false, message: 'Failed to generate daily analytics: ' + error.message };
  }
}
function initializeSpreadsheet() {
  try {
    const sheetNames = Object.values(CONFIG.SHEETS);
    sheetNames.forEach(sheetName => {
      getSheet(sheetName);
    });
    const adminsSheet = getSheet(CONFIG.SHEETS.ADMINS);
    const adminData = adminsSheet.getDataRange().getValues();
    if (adminData.length <= 1 || adminData[1][0] === '') {
      adminsSheet.appendRow([
        CONFIG.ADMIN_CREDENTIALS.username,
        CONFIG.ADMIN_CREDENTIALS.password,
        new Date()
      ]);
    }
    return { success: true, message: 'Spreadsheet initialized successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to initialize spreadsheet. Error: ' + error.message };
  }
}
function testConnection() {
  try {
    const spreadsheet = getSpreadsheet();
    return {
      success: true,
      message: 'Connection successful',
      spreadsheetName: spreadsheet.getName(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection failed: ' + error.message
    };
  }
}