"""TO-DO: Write a description of what this XBlock is."""
import datetime
import pytz
import json
import logging
# import io

log = logging.getLogger(__name__)

logging.basicConfig(level = logging.ERROR)

logging.disable(logging.CRITICAL)
logging.disable(logging.DEBUG)
logging.disable(logging.INFO)


import pkg_resources
from xblock.core import XBlock
from xblock.fields import Integer, Scope,String, DateTime, Boolean
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin
import MySQLdb
import settings as s
import requests


# @XBlock.needs('fs')
@XBlock.needs("i18n")
@XBlock.wants('user')
class CPSXBlock(StudioEditableXBlockMixin,XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    Matching_Algorithm = String(
        default="FCFS", scope=Scope.settings,
        help="matching algorithm - do not select gender variables, the functionality to automate disabling those variables, if genders for all users are not available, is yet to be implemented",
        values=('FCFS', 'demoSharkJet-homogeneous','demoSharkJet-homogeneous','gender-homogeneous', 'gender-heterogeneous')
    )

    Group_Size = String(
        default=5, scope=Scope.settings,
        help="Size of group, specify numnber only"
    )
    Collaboration_Type = String(
        default='chat', scope=Scope.settings,
        help="accepted values: chat(for chat only),audio(for both chat and audio)"
    )

    editable_fields = ('Matching_Algorithm','Group_Size','Collaboration_Type')
    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    display_name = String(
        display_name="CPSXBlock",
        help="Real-time Collaborative tool",
        scope=Scope.settings,
        default="CPSXBlock"
    )


    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        """
        The primary view of the TogetherJsXBlock, shown to students
        when viewing courses.
        """

        html = self.resource_string("static/html/cpsxblock.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/cpsxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/cpsxblock.js"))
        frag.add_javascript(self.resource_string("static/js/togetherjs-min.js"))
        frag.initialize_js('CPSXBlock', {'collab_type': self.Collaboration_Type})
        return frag



    @property
    def course_id(self):
        if hasattr(self, 'xmodule_runtime'):
            if hasattr(self.xmodule_runtime.course_id, 'to_deprecated_string'):
                return self.xmodule_runtime.course_id.to_deprecated_string()
            else:
                return self.xmodule_runtime.course_id
        return 'course-v1:NYU+DEMO_101+2018_T1'

    @XBlock.json_handler
    def getPartners(self,data,suffix=''):
        return self.getAvailablePartners()

    def getAvailablePartners(self):
        curr_user = self.get_userid()
        data = {'curr_user': curr_user, 'pairing_type': self.Matching_Algorithm}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/getAvailablePartners",
                                 json=data)
        if response.text != "no partner available":
            ids = json.loads(response.text)
        else:
            return ""
        av_ids = []
        av_genders = []
        for i in ids:
            av_ids.append(i['user_id'])
            av_genders.append(i['gender'])
        return av_ids,av_genders


    @XBlock.json_handler
    def updateToDefaultCohort(self,data,suffix):
        curr_user = self.get_userid()
        data = {'curr_user': curr_user, 'course_id': str(self.course_id)}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/updateToDefaultCohort",
                                 json=data)
        return str(response.text)

    @XBlock.json_handler
    def pair(self,data,suffix=''):
        content = {'user1': int(self.get_userid()), 'user2': int(data['partner']), 'course_id': str(self.course_id)}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/pairUsers",
                                 json=content)
        room = str(response.text)
        return {"room": room, "size": self.Group_Size, "s_id": self.get_userid(), "s_session": room}


    def pair_users(self, partner):
        content = {'user1': int(self.get_userid()), 'user2': int(partner), 'course_id': str(self.course_id)}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/pairUsers",json=content)
        room = str(response.text)
        return {"room": room, "size": self.Group_Size, "s_id": self.get_userid(), "s_session": room}

    @XBlock.json_handler
    def getRoom(self,data,suffix=''):
        curr_user = self.get_userid()
        data = {'curr_user': curr_user}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/users/getRoom",
                                 json=data)
        room = str(response.text)
        return {"room": room, "size": self.Group_Size, "s_id": self.get_userid(), "s_session": room}

    @XBlock.json_handler
    def addToUserPool(self,data,suffix=''):
        """
        a handler which adds the current user to online userPool

        :return: boolean signifying success/failure result
        """
        curr_user = self.get_userid()
        data = {'curr_user':curr_user}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/addToUserPool",json=data)
        if response.text == "success":
            return True
        return False

    @XBlock.json_handler
    def removeFromUserPool(self, data, suffix=''):
        """
        a handler which adds the current user to online userPool

        :return: boolean signifying success/failure result
        """
        curr_user = self.get_userid()
        data = {'curr_user': curr_user}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/UserPoolToOffline",
                                 json=data)
        if response.text == "success":
            return True
        return False

    @XBlock.json_handler
    def updateLastOnline(self, data, suffix=''):
        """
        a handler which adds the current user to online userPool

        :return: boolean signifying success/failure result
        """
        curr_user = self.get_userid()
        data = {'curr_user': curr_user}
        response = requests.post("http://ec2-54-156-197-224.compute-1.amazonaws.com:3000/onlinePool/updateLastOnlineUserPool",
                                 json=data)
        if response.text == "success":
            return True
        return False

    @XBlock.json_handler
    def returnUserName(self, data, suffix=''):
        """
           a handler which returns user name.
        """
        return {"s_name": self.get_user().full_name,
                "s_id":self.get_userid(),
                "username": self.get_user().opt_attrs.get('edx-platform.username'),
                "user_id": self.get_user().opt_attrs.get('edx-platform.user_id'),
                "emails": self.get_user().emails,
                "is_auth": self.get_user().opt_attrs.get('edx-platform.is_authenticated'),
                "is_staff": self.get_user().opt_attrs.get('edx-platform.is_staff')
                }

    def get_user(self):
        """Get an attribute of the current user."""
        user_service = self.runtime.service(self, 'user')
        if user_service:
            # May be None when creating bok choy test fixtures
            return user_service.get_current_user()
        return None

    def get_userid(self):
        try:
            return self.get_user().opt_attrs['edx-platform.user_id']
        except:
            return '4'


    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("CPSXBlock",
             """<cpsxblock/>
             """),
            ("Multiple cpsxblock",
             """<vertical_demo>
                <cpsxblock/>
                <cpsxblock/>
                <cpsxblock/>
                </vertical_demo>
             """),
        ]