**English** | [简体中文](dev.md)

# Developer changelog

### Changes on 2018-09-14
1、formSerialize now reads radio-button data and upload controls directly, without a separate GetFilesAddress call.
### 2018-9-24
1. Changed com.edit callback parameters and added a node parameter.

### 2018-9-28
1.  Added the com.prompt interface.

2. Added this.deleteallrows() to remove multiple rows while editing.

### 2018-9-29
 
1. Added instant upload to WebUploader for file deduplication. Server upload paths now use username/year/month/filename.

### 2018-9-30

1. Fixed a WebUploader instant-upload issue that repeated MD5 validation when multiple controls loaded.

### 2018-10-12

1. Fixed Chinese characters in URLs under IE by applying encodeURIComponent.

### 2019-1-13

1. Fixed retrieval of checkbox and radio-button values in formSerialize(). 


### 2019-1-17

1. Added basic data formatting and a consistent message for review workflow lists.