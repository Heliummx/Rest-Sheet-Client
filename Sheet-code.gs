function onOpen(e) {
  Logger.log("Open");
  getAllProducts();
}

function getURL(){
  return "https://api-url.com/demo/";
}
function getPass(){
  return "p4ss";
}

function getAllProducts() {
  var url = getURL()+"getAllProducts";

  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Basic " + Utilities.base64Encode("HTTP_USER" + ":" + getPass()) 
  };

  var options = {
  "method": "GET",
  "contentType": "application/json",
  "headers": headers  
  };
  
  var response = UrlFetchApp.fetch(url, options);
  
  setProductsInSheet(response);
}



function setProductsInSheet(response){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  sheet.getRange("A2:K").clearContent();
  //Logger.log(response);
  
  response = JSON.parse(response)
  var allProducts = [];
  for(var r in response){
    var product=[]
    
    product.push('=IMAGE("'+response[r].imageURL+'")');
    product.push(response[r].sku);
    product.push(response[r].title);
    product.push(response[r].variantId);
    product.push(response[r].inventoryId);
    product.push(response[r].price);
    product.push(response[r].stock);
    product.push(response[r].price);
    product.push(response[r].stock);
    product.push(response[r].compareAtPrice);
    product.push(response[r].compareAtPrice);
    
    allProducts.push(product);
  }
  
  var range = sheet.getRange(2,1,allProducts.length, 11);
  range.setValues(allProducts);
}

/////////////////////////////Price updates///////////////////////////////

function updatePrice(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var range = sheet.getDataRange();
  
  var allProductsSheet = range.getValues();
  
  getUpdatablePrices(allProductsSheet);
  
  setOldPrice();
  
}

function setOldPrice(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]
  
  var newPriceRange = sheet.getRange("F2:F");
  var oldPriceRange = sheet.getRange("H2:H");
  newPriceRange.copyTo(oldPriceRange);
}

function getUpdatablePrices(allProducts){
  var updatedProducts=[];

  for(var product in allProducts){
    var productObject={id:"",price:""} 
    
    if(allProducts[product][5] != allProducts[product][7]){
      if(typeof(allProducts[product][5])=="number"){
        productObject.id=allProducts[product][3].toString();
        productObject.price=allProducts[product][5].toString();
        
        updatedProducts.push(productObject);
        
      }
    }
  }
    
  if(updatedProducts.length > 0){
  var url = getURL()+"updatePrice";

  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Basic " + Utilities.base64Encode("HTTP_USER" + ":" + getPass()) 
  };

  var options = {
  "method": "POST",
  "contentType": "application/json",
  "headers": headers,
  "payload": JSON.stringify(updatedProducts)
  };
  
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response);
  }
  else{
    Logger.log("No cambió nada");
  }
  
}

/////////////////////////////Stock updates///////////////////////////////

function updateStock(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var range = sheet.getDataRange();
  
  var allProductsSheet = range.getValues();
  
  getUpdatableStocks(allProductsSheet);
  setOldStock();
} 

function setOldStock(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]
  
  var newPriceRange = sheet.getRange("G2:G");
  var oldPriceRange = sheet.getRange("I2:I");
  newPriceRange.copyTo(oldPriceRange);
}

function getUpdatableStocks(allProducts){
  var updatedProducts=[];

  for(var product in allProducts){
    var productObject={inventory_item_id:"",available:""} 
    
    if(allProducts[product][6] != allProducts[product][8]){
      if(typeof(allProducts[product][6])=="number"){
        Logger.log("updateStock");
        productObject.inventory_item_id=allProducts[product][4].toString();
        productObject.available=allProducts[product][6].toString();
        
        updatedProducts.push(productObject);
      }
    }
  }
    
  if(updatedProducts.length > 0){
    var url = getURL()+"updateStock";

    var headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Basic " + Utilities.base64Encode("HTTP_USER" + ":" + getPass()) 
    };

    var options = {
      "method": "POST",
      "contentType": "application/json",
      "headers": headers,
      "payload": JSON.stringify(updatedProducts)
    };
  
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response);
  }
  else{
    Logger.log("No cambió nada");
  }
  
}




/////////////////////////////Compare at price %///////////////////////////////

function getPriceFromPerc(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var range = sheet.getDataRange();
  
  var allProductsSheet = range.getValues();
  
  getUpdatabalePriceFromPerc(allProductsSheet);
}

function getUpdatabalePriceFromPerc(allProducts){
  var updatedProducts=[];
 
  for(var product in allProducts){
    var productObject={id:"",compare_at_price:""} 
    if(allProducts[product][12] != allProducts[product][13]*100){
      if(typeof(allProducts[product][12])=="number"){
        var newComparePrice=(( allProducts[product][5]*allProducts[product][12])/(100-allProducts[product][12]))+allProducts[product][5];
                
        if(newComparePrice > allProducts[product][5]){
          productObject.id=allProducts[product][3].toString();
          productObject.compare_at_price=newComparePrice.toString();
        
          updatedProducts.push(productObject);
        }
        
      }
    }
  }
    
  if(updatedProducts.length > 0){
  var url = getURL()+"updateCompareAtPrice";

  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Basic " + Utilities.base64Encode("HTTP_USER" + ":" + getPass()) 
  };

  var options = {
  "method": "POST",
  "contentType": "application/json",
  "headers": headers,
  "payload": JSON.stringify(updatedProducts)
  };
  
  var response = UrlFetchApp.fetch(url, options);
  getAllProducts();
  }
  else{
    Logger.log("No cambió nada");
  }
  
}


/////////////////////////////Compare at price updates///////////////////////////////


function updateCompareAtPrice(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var range = sheet.getDataRange();
  
  var allProductsSheet = range.getValues();
  
  getUpdatableCompareAtPrice(allProductsSheet);
} 

function getUpdatableCompareAtPrice(allProducts){
  var updatedProducts=[];

  for(var product in allProducts){
    var productObject={id:"",compare_at_price:""} 
    
    if(allProducts[product][9] != allProducts[product][10]){
      if(typeof(allProducts[product][9])=="number"){
        if(allProducts[product][9] > allProducts[product][5]){
        productObject.id=allProducts[product][3].toString();
        productObject.compare_at_price=allProducts[product][9].toString();
        
        updatedProducts.push(productObject);
        }
         else{
        productObject.id=allProducts[product][3].toString();
        productObject.compare_at_price="";
       
        updatedProducts.push(productObject);
        }
      }
    }
  }
    
  if(updatedProducts.length > 0){
  var url = getURL()+"updateCompareAtPrice";

  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Basic " + Utilities.base64Encode("HTTP_USER" + ":" + getPass()) 
  };

  var options = {
  "method": "POST",
  "contentType": "application/json",
  "headers": headers,
  "payload": JSON.stringify(updatedProducts)
  };
  
  var response = UrlFetchApp.fetch(url, options);
  }
  else{
    Logger.log("No cambió nada");
  }
  
}