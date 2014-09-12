var AWS = require('aws-sdk');

/**
 * S3Sizer does the job of calculating the size of S3 folders.
 * @param {object} params Options to be used when creating the object.
 * @config {string} [params.configFile] File path of aws configuration file.
 * @config {string} [params.accessKeyId] AWS access key id.
 * @config {string} [params.secretAccessKey] AWS secret access key. If
 * accessKeyId is included then secretAccessKey must also be included.
 * @config {string} [params.region] The AWS region to make calls against.
 */
var S3Sizer = function(params) {
  if(params.hasOwnProperty('configFile')) {
    AWS.config.loadFromPath(params.configFile);
  }

  if(params.hasOwnProperty('accessKeyId') && params.hasOwnProperty('secretAccessKey')) {
    AWS.config.update({accessKeyId : params.accessKeyId, secretAccessKey : params.secretAccessKey});
  }

  if(params.hasOwnProperty('region')) {
    AWS.config.update({region : params.region});
  }

  this.s3 = new AWS.S3();
};

/**
 * Gets the combined file size of all the objects in a S3 folder.
 * @param  {string}   bucket   The bucket that the folder exists in.
 * @param  {string}   folder   The folder to calculate the size of.
 * @param  {function} callback Callback function that will be called once size
 * has been calculated.
 */
S3Sizer.prototype.getFolderSize = function(bucket, folder, callback) {
  this._getFolderSize(bucket, folder, callback);
};

/**
 * Internal recursive get folder size function.
 * @param  {string}   bucket   The bucket that the folder exists in.
 * @param  {string}   folder   The folder to calculate the size of.
 * @param  {string}   [marker] The object key to start with on request.
 * @param  {function} callback Callback function that will be called when an
 * error occurs or size has been calculated.
 */
S3Sizer.prototype._getFolderSize = function(bucket, folder, marker, callback) {
  var self = this;
  var params = {
    Bucket : bucket,
    Prefix : folder + '/'
  };
  if(typeof marker === 'function') {
    callback = marker;
    marker = null;
  }
  if(marker !== null) {
    params.Marker = marker;
  }

  (this.s3.client || this.s3).listObjects(params, function(err, data) {
    if(err) {
      return callback(err, null);
    }
    var size = 0;
    if(data.hasOwnProperty('Contents')) {
      size = self._calculateObjectsSize(data.Contents);
    }
    if(!data.IsTruncated) {
      return callback(null, size);
    }
    marker = data.Contents[data.Contents.length - 1].Key;
    self._getFolderSize(bucket, folder, marker, function(err, nsize) {
      if(err) {
        return callback(err, null);
      }
      return callback(null, size + nsize);
    });
  });
};

/**
 * Calculates the size of the objects in the array passed in.
 * @param  {array} objects The objects to add up.
 * @return {number}        The total size of the objects.
 */
S3Sizer.prototype._calculateObjectsSize = function(objects) {
  var size = 0;
  for (var i = 0; i < objects.length; i++) {
    size += objects[i].Size;
  }
  return size;
};

module.exports = S3Sizer;
