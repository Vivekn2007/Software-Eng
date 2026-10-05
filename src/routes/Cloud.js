const express = require('express');
const router = express.Router();


const {S3Client , PutObjectCommand,GetObjectCommand , DeleteObjectCommand,DeleteObjectsCommand,ListObjectVersionsCommand} = require('@aws-sdk/client-s3');
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({region : process.env.AWS_REGION,requestChecksumCalculation: 'WHEN_REQUIRED',  
    responseChecksumValidation: 'WHEN_REQUIRED'  });

const listVersions = async (bucketName, fileKey) => {
  const command = new ListObjectVersionsCommand({
    Bucket: bucketName,
    Prefix: fileKey,
  });

  const response = await s3.send(command);
  return {
    versions: response.Versions || [],
    deleteMarkers: response.DeleteMarkers || [],
  };
};

async function  upload(fileName,fileType,SellerId,accessType,){
    const key = `uploads/${SellerId}/${accessType}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket : process.env.S3_BUCKET,
        Key : key,
        ContentType : fileType
    });
    const url  = await getSignedUrl(s3,command,{expiresIn : 300});
    return {url,key};
}



async function deleteOnce(key){
    const { versions, deleteMarkers } = await listVersions(process.env.S3_BUCKET, key);
    const allObjects = [
    ...versions.map((v) => ({ Key: v.Key, VersionId: v.VersionId })),
    ...deleteMarkers.map((m) => ({ Key: m.Key, VersionId: m.VersionId })),
  ];
  if (allObjects.length === 0) {
    console.log("No versions found.");
    return;
  }
    const command = new DeleteObjectsCommand({
        Bucket : process.env.S3_BUCKET,
        Delete: { Objects: allObjects },
    })
    const resp = await s3.send(command);
    console.log("File deleted Sucessfully",resp.Deleted);
}

async function getUrl(key){
    const command = new GetObjectCommand({
        Bucket : process.env.S3_BUCKET, 
        Key : key
    });
    const url = await getSignedUrl(s3,command,{expiresIn : 3600});
    return url;
}
module.exports = {upload,getUrl,deleteOnce};