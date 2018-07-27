/**
 * GitHub  https://github.com/tanaikech/RangeListApp<br>
 * @param {Object} spreadsheet Instance of a Spreadsheet.
 * @return {RangeListApp}
 */
function getSpreadsheet(spreadsheet) {
    this.spreadsheet = spreadsheet;
    return this
}

/**
 * @param {Object} rangeList Range list created by 1 dimensional array.
 * @return {RangeListApp}
 */
function getRangeList(rangeList) {
    this.rangeList = rangeList;
    return this
}

/**
 * setValues method for RangeListApp.<br>
 * @param {Object} values Values (number, string and bool) for putting to Spreadsheet. This is one dimensional array.
 * @return {Object} Return Object
 */
function setValues(values) {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.setValues(values);
}

/**
 * replaceValues method for RangeListApp.<br>
 * @param {Object} regex Regex which is used for replacing.
 * @param {Object} value Value for replacing.
 * @return {Object} Return Object
 */
function replaceValues(regex, value) {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.replaceValues(regex, value);
}

/**
 * replaceFormulas method for RangeListApp.<br>
 * @param {Object} regex Regex which is used for replacing.
 * @param {Object} value Value for replacing.
 * @return {Object} Return Object
 */
function replaceFormulas(regex, value) {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.replaceFormulas(regex, value);
}

/**
 * setCheckBox method for RangeListApp.<br>
 * @param {Object} values String values which are used for true and false. This is one dimensional array. The element 0 and 1 mean true and false.
 * @return {Object} Return Object
 */
function setCheckBox(values) {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.setCheckBox(values);
}

/**
 * getFormulas method for RangeListApp.<br>
 * @return {Object} Return Object
 */
function getFormulas() {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.getFormulas();
}

/**
 * getDisplayValues method for RangeListApp.<br>
 * @return {Object} Return Object
 */
function getDisplayValues() {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.getDisplayValues();
}

/**
 * getValues method for RangeListApp.<br>
 * @return {Object} Return Object
 */
function getValues() {
    var rl = new RangeListApp(this.rangeList, this.spreadsheet);
    return rl.getValues();
}

// SpreadsheetApp.getActiveSpreadsheet(); // For scope
;
(function(r) {
  var RangeListApp;
  RangeListApp = (function() {
    var addQuery, createReqForSetChkeckBox, createReqForSetValues, createReqRepeatCellChkBox, createReqRepeatCellUpdate, createReqSingleCellChkBox, createReqSingleCellUpdate, fetch, getDataValues, getidentification, parseRange, replaceValues, setDataValues, setReplacedValues;

    RangeListApp.name = "RangeListApp";

    function RangeListApp(rangeList_, spreadsheet_) {
      if (!rangeList_ || rangeList_.length === 0) {
        throw new Error("rangeList was not found.");
      }
      if (!Array.isArray(rangeList_)) {
        throw new Error("rangeList was not an array.");
      }
      if (!spreadsheet_) {
        throw new Error("spreadsheet was not found.");
      }
      this.rangeList = rangeList_;
      this.url = "https://sheets.googleapis.com/v4/spreadsheets/";
      this.headers = {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
      };
      if (!spreadsheet_ || spreadsheet_ === void 0) {
        this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      } else {
        this.spreadsheet = spreadsheet_;
      }
      this.sheet = SpreadsheetApp.getActiveSheet();
      this.spreadsheetId = this.spreadsheet.getId();
      this.sheetId = this.sheet.getSheetId();
    }

    RangeListApp.prototype.setValues = function(values) {
      return setDataValues.call(this, "values", values);
    };

    RangeListApp.prototype.replaceValues = function(regex, value) {
      var src, values;
      src = getDataValues.call(this, "UNFORMATTED_VALUE");
      values = replaceValues.call(this, src, regex, value);
      return setReplacedValues.call(this, values);
    };

    RangeListApp.prototype.replaceFormulas = function(regex, value) {
      var src, values;
      src = getDataValues.call(this, "FORMULA");
      values = replaceValues.call(this, src, regex, value);
      return setReplacedValues.call(this, values);
    };

    RangeListApp.prototype.setCheckBox = function(values) {
      return setDataValues.call(this, "checkbox", values);
    };

    RangeListApp.prototype.getValues = function() {
      return getDataValues.call(this, "UNFORMATTED_VALUE");
    };

    RangeListApp.prototype.getDisplayValues = function() {
      return getDataValues.call(this, "FORMATTED_VALUE");
    };

    RangeListApp.prototype.getFormulas = function(srcv, regex, value) {
      return getDataValues.call(this, "FORMULA");
    };

    replaceValues = function(src, regex, value) {
      if (src == null) {
        throw new Error("Range is not found.");
      }
      if (value == null) {
        throw new Error("Value for replacing was not found.");
      }
      if (regex == null) {
        throw new Error("Regex was not found.");
      }
      src.forEach(function(e, i) {
        return src[i].values = e.values.map(function(f) {
          return f.map(function(g) {
            if (typeof g === "string") {
              return g.replace(regex, value);
            } else {
              return g;
            }
          });
        });
      });
      return src;
    };

    setReplacedValues = function(values) {
      var obj, req;
      obj = {
        data: values,
        valueInputOption: "USER_ENTERED"
      };
      req = [
        {
          method: "post",
          url: this.url + this.spreadsheetId + "/values:batchUpdate",
          headers: this.headers,
          contentType: "application/json",
          payload: JSON.stringify(obj),
          muteHttpExceptions: true
        }
      ];
      fetch.call(this, req);
      return this.rangeList;
    };

    setDataValues = function(ident, values) {
      var addCols, addRows, defCol, defRow, maxCol, maxRow, req, requests, rngList, setData;
      if (!values || values.length === 0) {
        throw new Error("Values was not found.");
      }
      defRow = 0;
      defCol = 0;
      maxRow = 0;
      maxCol = 0;
      rngList = parseRange.call(this, this.rangeList);
      addRows = [];
      addCols = [];
      setData = rngList.map((function(_this) {
        return function(e, i) {
          var col, initCol, initRow, numCols, numRows, range, row, sheet, sheetId, temp, val;
          sheet = null;
          sheetId = "";
          range = null;
          if (e.length === 1) {
            sheet = _this.sheet;
            sheetId = _this.sheetId;
            range = _this.sheet.getRange(e[0]);
          } else {
            sheet = _this.spreadsheet.getSheetByName(e[0]);
            sheetId = sheet.getSheetId();
            range = _this.sheet.getRange(e[1]);
          }
          defRow = sheet.getMaxRows();
          defCol = sheet.getMaxColumns();
          maxRow = defRow;
          maxCol = defCol;
          initRow = range.getRow();
          initCol = range.getColumn();
          numRows = range.getNumRows();
          numCols = range.getNumColumns();
          row = initRow;
          col = initCol;
          if (numRows > 1) {
            row = initRow + numRows - 1;
          }
          if (numCols > 1) {
            col = initCol + numCols - 1;
          }
          maxRow = maxRow < row ? row : maxRow;
          maxCol = maxCol < col ? col : maxCol;
          if (defRow !== maxRow) {
            temp = addRows.filter(function(e) {
              return e.appendDimension.sheetId === sheetId;
            });
            if (temp.length === 0) {
              addRows.push({
                appendDimension: {
                  sheetId: sheetId,
                  length: maxRow - defRow,
                  dimension: "ROWS"
                }
              });
            } else {
              if (temp[0].appendDimension.length < (maxRow - defRow)) {
                addRows.forEach(function(f, i) {
                  if (f.appendDimension.sheetId === sheetId) {
                    return addRows[i] = {
                      appendDimension: {
                        sheetId: sheetId,
                        length: maxRow - defRow,
                        dimension: "ROWS"
                      }
                    };
                  }
                });
              }
            }
          }
          if (defCol !== maxCol) {
            temp = addCols.filter(function(e) {
              return e.appendDimension.sheetId === sheetId;
            });
            if (temp.length === 0) {
              addCols.push({
                appendDimension: {
                  sheetId: sheetId,
                  length: maxCol - defCol,
                  dimension: "COLUMNS"
                }
              });
            } else {
              if (temp[0].appendDimension.length < (maxCol - defCol)) {
                addCols.forEach(function(f, i) {
                  if (f.appendDimension.sheetId === sheetId) {
                    return addCols[i] = {
                      appendDimension: {
                        sheetId: sheetId,
                        length: maxCol - defCol,
                        dimension: "COLUMNS"
                      }
                    };
                  }
                });
              }
            }
          }
          val = Array.isArray(values) ? values[i] : values;
          switch (ident) {
            case "values":
              return createReqForSetValues.call(_this, sheetId, initRow, initCol, numRows, numCols, val);
            case "checkbox":
              return createReqForSetChkeckBox.call(_this, sheetId, initRow, initCol, numRows, numCols, val);
          }
        };
      })(this));
      requests = [];
      if (addRows.length > 0) {
        Array.prototype.push.apply(requests, addRows);
      }
      if (addCols.length > 0) {
        Array.prototype.push.apply(requests, addCols);
      }
      Array.prototype.push.apply(requests, setData);
      req = [
        {
          method: "post",
          url: this.url + this.spreadsheetId + ":batchUpdate",
          headers: this.headers,
          contentType: "application/json",
          payload: JSON.stringify({
            requests: requests
          }),
          muteHttpExceptions: true
        }
      ];
      fetch.call(this, req);
      return this.rangeList;
    };

    createReqForSetValues = function(sheetId, initRow, initCol, numRows, numCols, val) {
      var identification, type;
      type = typeof val;
      identification = "";
      if (type === "number" || type === "boolean") {
        identification = type;
      } else if (type === "string") {
        if (val[0] === "=" && val[1] !== "=") {
          identification = "formula";
        } else if (val[0] === "=" && val[1] === "=") {
          identification = "string";
          val = val.slice(1);
        } else {
          identification = type;
        }
      } else {
        identification = "string";
        val = val.toString();
      }
      if (numRows === 1 && numCols === 1) {
        return createReqSingleCellUpdate.call(this, identification, sheetId, initRow, initCol, val);
      } else {
        return createReqRepeatCellUpdate.call(this, identification, sheetId, initRow, initCol, numRows, numCols, val);
      }
    };

    createReqForSetChkeckBox = function(sheetId, initRow, initCol, numRows, numCols, val) {
      if (numRows === 1 && numCols === 1) {
        return createReqSingleCellChkBox.call(this, sheetId, initRow, initCol, val);
      } else {
        return createReqRepeatCellChkBox.call(this, sheetId, initRow, initCol, numRows, numCols, val);
      }
    };

    getDataValues = function(option) {
      var endpoint, query, req, res;
      query = {
        majorDimension: "ROWS",
        valueRenderOption: option,
        fields: "valueRanges(range,values)",
        ranges: this.rangeList
      };
      endpoint = addQuery.call(this, this.url + this.spreadsheetId + "/values:batchGet", query);
      req = [
        {
          method: "get",
          url: addQuery.call(this, this.url + this.spreadsheetId + "/values:batchGet", query),
          headers: this.headers,
          muteHttpExceptions: true
        }
      ];
      res = fetch.call(this, req);
      return res.valueRanges;
    };

    parseRange = function(rangeList) {
      return rangeList.reduce(function(res, e) {
        r = e.split("!").map(function(f) {
          return f.replace(/'/g, "");
        });
        res.push(Array.prototype.concat.apply([], r));
        return res;
      }, []);
    };

    createReqSingleCellUpdate = function(identification, sheetId, initRow, initCol, value) {
      var obj;
      obj = {
        "updateCells": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": initRow - 1,
            "endRowIndex": initRow,
            "startColumnIndex": initCol - 1,
            "endColumnIndex": initCol
          },
          "rows": [
            {
              "values": [
                {
                  userEnteredValue: {}
                }
              ]
            }
          ],
          "fields": "userEnteredValue"
        }
      };
      getidentification.call(this, identification, obj.updateCells.rows[0].values[0].userEnteredValue, value);
      return obj;
    };

    createReqRepeatCellUpdate = function(identification, sheetId, initRow, initCol, numRows, numCols, value) {
      var obj;
      obj = {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": initRow - 1,
            "endRowIndex": initRow + numRows - 1,
            "startColumnIndex": initCol - 1,
            "endColumnIndex": initCol + numCols - 1
          },
          "cell": {
            "userEnteredValue": {}
          },
          "fields": "userEnteredValue"
        }
      };
      getidentification.call(this, identification, obj.repeatCell.cell.userEnteredValue, value);
      return obj;
    };

    createReqSingleCellChkBox = function(sheetId, initRow, initCol, value) {
      var obj;
      obj = {
        "updateCells": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": initRow - 1,
            "endRowIndex": initRow,
            "startColumnIndex": initCol - 1,
            "endColumnIndex": initCol
          },
          "rows": [
            {
              "values": [
                {
                  "dataValidation": {
                    "condition": {
                      "type": "BOOLEAN"
                    }
                  }
                }
              ]
            }
          ],
          "fields": "dataValidation"
        }
      };
      if (value.length === 2) {
        obj.updateCells.rows[0].values[0].dataValidation.condition.values = [
          {
            userEnteredValue: value[0]
          }, {
            userEnteredValue: value[1]
          }
        ];
      }
      return obj;
    };

    createReqRepeatCellChkBox = function(sheetId, initRow, initCol, numRows, numCols, value) {
      var obj;
      obj = {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": initRow - 1,
            "endRowIndex": initRow + numRows - 1,
            "startColumnIndex": initCol - 1,
            "endColumnIndex": initCol + numCols - 1
          },
          "cell": {
            "dataValidation": {
              "condition": {
                "type": "BOOLEAN"
              }
            }
          },
          "fields": "dataValidation"
        }
      };
      if (value.length === 2) {
        obj.repeatCell.cell.dataValidation.condition.values = [
          {
            userEnteredValue: value[0]
          }, {
            userEnteredValue: value[1]
          }
        ];
      }
      return obj;
    };

    getidentification = function(identification, v, value) {
      switch (identification) {
        case "boolean":
          return v.boolValue = value;
        case "formula":
          return v.formulaValue = value;
        case "number":
          return v.numberValue = value;
        case "string":
          return v.stringValue = value;
      }
    };

    addQuery = function(url_, obj_) {
      return url_ + Object.keys(obj_).reduce(function(p, e, i) {
        return p + (i === 0 ? "?" : "&") + (Array.isArray(obj_[e]) ? obj_[e].reduce(function(str, f, j) {
          return str + e + "=" + encodeURIComponent(f) + (j !== obj_[e].length - 1 ? "&" : "");
        }, "") : e + "=" + encodeURIComponent(obj_[e]));
      }, "");
    };

    fetch = function(req) {
      var err, res;
      res = UrlFetchApp.fetchAll(req);
      err = res.filter(function(e) {
        return e.getResponseCode() !== 200;
      });
      if (err.length > 0) {
        throw new Error(err.length + " errors occurred. ErrorMessage: " + err.toString());
        return;
      }
      return JSON.parse(res[0].getContentText());
    };

    return RangeListApp;

  })();
  return r.RangeListApp = RangeListApp;
})(this);
