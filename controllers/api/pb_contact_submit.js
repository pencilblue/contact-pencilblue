/*
    Copyright (C) 2015  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function ContactSubmit() {};

//inheritance
util.inherits(ContactSubmit, pb.BaseController);

ContactSubmit.prototype.render = function(cb) {
  var self = this;

  this.getJSONPostParams(function(err, post) {
    var message = self.hasRequiredParams(post, ['name', 'email']);
    if(message) {
      cb({
        code: 400,
        content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, message)
      });
      return;
    }

    var cos = new pb.CustomObjectService();
    cos.loadTypeByName('pb_contact', function(err, contactType) {
      if(util.isError(err) || !pb.utils.isObject(contactType)) {
        cb({
          code: 400,
          content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('INVALID_UID'))
        });
        return;
      }

      var contact = {
        name: post.name + ' (' + pb.utils.uniqueId().toString() + ')',
        email: post.email,
        description: post.email,
        comment: post.comment,
        date: new Date()
      };

      pb.CustomObjectService.formatRawForType(contact, contactType);
      var customObjectDocument = pb.DocumentCreator.create('custom_object', contact);

      cos.save(customObjectDocument, contactType, function(err, result) {
        if(util.isError(err)) {
          cb({
            code: 500,
            content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('ERROR_SAVING'))
          });
          return;
        }
        else if(util.isArray(result) && result.length > 0) {
          cb({
            code: 500,
            content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('ERROR_SAVING'))
          });
          return;
        }

        cb({content: pb.BaseController.apiResponse(pb.BaseController.API_SUCCESS, 'contact submitted')});
      });
    });
  });
};

ContactSubmit.getRoutes = function(cb) {
  var routes = [
    {
      method: 'post',
      path: '/api/contact/pb_contact_submit',
      auth_required: false,
      content_type: 'application/json'
    }
  ];
  cb(null, routes);
};

//exports
module.exports = ContactSubmit;
