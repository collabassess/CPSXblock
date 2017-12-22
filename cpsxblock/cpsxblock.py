"""TO-DO: Write a description of what this XBlock is."""
# import datetime
# import pytz
# import json
# import logging
# # import io

# log = logging.getLogger(__name__)
#
# logging.basicConfig(level = logging.ERROR)
#
# logging.disable(logging.CRITICAL)
# logging.disable(logging.DEBUG)
# logging.disable(logging.INFO)


import pkg_resources
from xblock.core import XBlock
from xblock.fields import Integer, Scope,String, DateTime, Boolean
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin
import MySQLdb
import settings as s


# @XBlock.needs('fs')
@XBlock.needs("i18n")
@XBlock.wants('user')
class CPSXBlock(StudioEditableXBlockMixin,XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    Matching_Algorithm = String(
        default="Random", scope=Scope.settings,
        help="matching algorithm"
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


    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    @XBlock.json_handler
    def returnRoom(self, data, suffix=''):
        """
        a handler which returns the chat room name.
        """
        cnx = MySQLdb.connect(**s.database)
        cursor = cnx.cursor()
        curr_user = self.get_userid()

        cursor.execute("""
                           SELECT * from user_groups
                           WHERE user1=%s OR user2=%s
                       """, (curr_user, curr_user))

        if not cursor.rowcount:
            cursor.execute("""
                               SELECT * from user_groups
                               WHERE user1 IS NULL OR user2 IS NULL
                            """)
            if not cursor.rowcount:
                cursor.execute("""
                                   INSERT INTO user_groups(course_id,user1) VALUES (%s,%s)
                               """,
                               ('1', curr_user))
                cnx.commit()
            else:
                for (group_id, course_id, user1, user2) in cursor:
                    if user1 is None:
                        cursor.execute("""
                                        UPDATE user_groups
                                        SET user1=%s
                                        WHERE group_id=%s && course_id=%s
                                       """,
                                       (curr_user, group_id, course_id))
                        cnx.commit()
                    elif user2 is None:
                        cursor.execute("""
                                        UPDATE user_groups
                                        SET user2=%s
                                        WHERE group_id=%s && course_id=%s
                                       """,
                                       (curr_user, group_id, course_id))
                        cnx.commit()

        cursor.execute("""
                        SELECT * from user_groups
                        WHERE user1=%s OR user2=%s
                       """, (curr_user, curr_user))
        #log.error("here")
        for (group_id, course_id, user1, user2) in cursor:
            temp = str("room"+str(group_id)+str(course_id))
            group = str(group_id)
            cursor.close()
            cnx.close()
            return {"room": temp,"size":self.Group_Size, "s_id":self.get_userid(),"s_group":group}



    @XBlock.json_handler
    def returnUserName(self, data, suffix=''):
        """
           a handler which returns user name.
        """
        return {"s_name": self.get_user().full_name, "s_id":self.get_userid()}

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