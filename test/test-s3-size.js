var S3Sizer = require('../index');
    configFile = __dirname + '/awscreds.json',
    s3Sizer = new S3Sizer({configFile : configFile}),
    expect = require('expect.js'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync(configFile));

describe('S3 Sizer Module', function() {
  describe('#getFolderSize', function() {
    it('should return the total size in bytes of folder', function(done) {
      // get test storage size
      s3Sizer.getFolderSize(config.bucket, config.folder, function(err, size) {
        expect(err).to.not.be.ok();
        expect(size).to.be(1354482);
        done();
      });
    });
    it('should return the 0 is there are no items in folder', function(done) {
      // get test storage size
      s3Sizer.getFolderSize(config.bucket, config.zeroFolder, function(err, size) {
        expect(err).to.not.be.ok();
        expect(size).to.be(0);
        done();
      });
    });
    it("should return 0 if folder doesn't exist", function(done) {
      // get test storage size
      s3Sizer.getFolderSize(config.bucket, 'NON_EXISTENT_FOLDER', function(err, size) {
        expect(err).to.not.be.ok();
        expect(size).to.be(0);
        done();
      });
    });
  });
});