import Firestore from "@google-cloud/firestore";
import { count } from "console";
import { createHmac } from "crypto";

//Instantiating Firestore with project details
const db = new Firestore({
  projectId: "cloud1-340711",
  keyFilename: "./key.json",
});

//Collection (Table)
//Document (Row)
//docRef selects the collection
export async function AddDocument(collection, data) {
  const docRef = db.collection(collection).doc();
  return await docRef.set(data);
}

export async function GetDocument(collection, valueType, value) {
  const docRef = db.collection(collection);
  const snapshot = await docRef.where(valueType, "==", value).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

export async function GetTable(collection){
  const docRef = db.collection(collection);
  const snapshot = await docRef.get();
  let data = [];
  snapshot.forEach(doc => {
    data.push(doc.data());
  });
  return data;
}

export function HashPassword(password) {
  const secret = "i<3PfC";
  return createHmac("sha256", password).update(secret).digest("hex");
}

export async function IncrementCount(id){
  const docRef = db.collection("categories").doc(id)
  const doc = await docRef.get();

  return await docRef.update({
      count: parseInt(doc.data().count) + 1,
  });
}

export async function AddLink(link) {
  return await AddDocument("links", {link: link});
}

export async function GetLinks(){
  const results = await GetTable("links");
  if(results.length == 0){
    console.log("No conversions found for given user");
  }
  return results;
}