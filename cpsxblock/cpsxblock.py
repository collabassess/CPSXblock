import json
import logging

import pkg_resources
from xblock.core import XBlock
from xblock.fields import Integer, Scope, String
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin
import requests

log = logging.getLogger(__name__)

logging.basicConfig(level = logging.ERROR)

logging.disable(logging.CRITICAL)
logging.disable(logging.DEBUG)
logging.disable(logging.INFO)

# @XBlock.needs('fs')
@XBlock.needs("i18n")
@XBlock.wants('user')
class CPSXBlock(StudioEditableXBlockMixin, XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    API_Host = String(
        default="localhost", scope=Scope.settings,
        help="Hostname where the CPSX API is located"
    )

    API_Port = Integer(
        default=3000, scope=Scope.settings,
        help="Port on which the CPSX API is listening"
    )

    Matching_Algorithm = String(
        default="FCFS", scope=Scope.settings,
        help="matching algorithm - do not select gender variables, the functionality to automate disabling those variables, if genders for all users are not available, is yet to be implemented",
        values=('FCFS', 'demoSharkJet-homogeneous','demoSharkJet-heterogeneous','gender-homogeneous', 'gender-heterogeneous')
    )

    Group_Size = String(
        default=2, scope=Scope.settings,
        help="Size of group, specify number only"
    )

    Collaboration_Type = String(
        default='chat', scope=Scope.settings,
        help="accepted values: chat(for chat only),audio(for both chat and audio)"
    )

    Shareable_Hint_Block_Code = String(
        default='d0413bf128374e90889b1a151aeec014', scope = Scope.settings,
        help ="if you want to assign partners one hint each, enter the block code of the component, can find in component -> edit -> settings -> componenet ID location, e.g: if CompoenentID=block-v1:NYU+DEMO_101+2018_T1+type@problem+block@078DE_COL_H2, block code is 078DE_COL_H2  !"
    )

    theme_shared_content = String(
        default = '', scope = Scope.settings,
        help = "stylize blocks which are shared amongst patners, enter comma separated serial number of component - 0,1,2,3..."
    )

    theme_unique_content = String(
        default='', scope=Scope.settings,
        help="stylize blocks which are unique amongst patners, enter comma separated serial number of component - 0,1,2,3..."
    )

    editable_fields = (
        'API_Host',
        'API_Port',
        'Matching_Algorithm',
        'Group_Size',
        'Collaboration_Type',
        'Shareable_Hint_Block_Code',
        'theme_shared_content',
        'theme_unique_content'
    )
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
        frag.initialize_js('CPSXBlock', {'collab_type': self.Collaboration_Type,
                                         'shareable_hints':self.Shareable_Hint_Block_Code,
                                         'shared_blocks':self.theme_shared_content,
                                         'unique_blocks':self.theme_unique_content})
        return frag

    @property
    def course_id(self):
        if hasattr(self, 'xmodule_runtime'):
            if hasattr(self.xmodule_runtime.course_id, 'to_deprecated_string'):
                return self.xmodule_runtime.course_id.to_deprecated_string()
            else:
                return self.xmodule_runtime.course_id
        return 'course-v1:NYU+DEMO_101+2018_T1'
    
    def post_api(self, uri, json_data):
        """
        Performs an HTTP request to the API with `json_data` as a dict
        """
        return requests.post("{0}:{1}{2}".format(self.API_Host, self.API_Port, uri), json=json_data)

    @XBlock.json_handler
    def getPartners(self,data,suffix=''):
        return self.getAvailablePartners()

    def getAvailablePartners(self):
        curr_user = self.get_userid()
        data = {'curr_user': curr_user, 'pairing_type': self.Matching_Algorithm}
        response = self.post_api("/onlinePool/getAvailablePartners", data)

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
        response = self.post_api("/onlinePool/updateToDefaultCohort", data)

        return str(response.text)

    @XBlock.json_handler
    def pair(self,data,suffix=''):
        content = {'user1': int(self.get_userid()), 'user2': int(data['partner']), 'course_id': str(self.course_id)}
        response = self.post_api("/onlinePool/pairUsers", content)
        room = str(response.text)
        return {"room": room, "size": self.Group_Size, "s_id": self.get_userid(), "s_session": room}


    def pair_users(self, partner):
        content = {'user1': int(self.get_userid()), 'user2': int(partner), 'course_id': str(self.course_id)}
        response = self.post_api("/onlinePool/pairUsers", content)
        room = str(response.text)
        return {"room": room, "size": self.Group_Size, "s_id": self.get_userid(), "s_session": room}

    @XBlock.json_handler
    def getRoom(self,data,suffix=''):
        curr_user = self.get_userid()
        data = {'curr_user': curr_user}
        response = self.post_api("/users/getRoom", data)
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
        response = self.post_api("/onlinePool/addToUserPool", data)
        
        return response.text == "success"

    @XBlock.json_handler
    def removeFromUserPool(self, data, suffix=''):
        """
        a handler which adds the current user to online userPool

        :return: boolean signifying success/failure result
        """
        curr_user = self.get_userid()
        data = {'curr_user': curr_user}
        response = self.post_api("/onlinePool/UserPoolToOffline", data)
        
        return response.text == "success"

    @XBlock.json_handler
    def updateLastOnline(self, data, suffix=''):
        """
        a handler which adds the current user to online userPool

        :return: boolean signifying success/failure result
        """
        curr_user = self.get_userid()
        data = {'curr_user': curr_user}
        response = self.post_api("/onlinePool/updateLastOnlineUserPool", data)
        
        return response.text == "success"

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
            return '4' # Why 4?


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