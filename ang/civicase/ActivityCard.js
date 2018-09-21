(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('caseActivityCard', function () {
    return {
      restrict: 'A',
      templateUrl: function (elem, attrs) {
        switch (attrs.mode) {
          case 'big':
            return `~/civicase/ActivityCard--Big.html`;
          case 'long':
            return `~/civicase/ActivityCard--Long.html`;
          default:
            return `~/civicase/ActivityCard--Short.html`;
        }
      },
      controller: caseActivityCardController,
      scope: {
        activity: '=caseActivityCard',
        refresh: '=refreshCallback',
        editActivityUrl: '=?editActivityUrl',
        type: '=type'
      }
    };
  });

  function caseActivityCardController ($scope, getActivityFeedUrl, dialogService, templateExists, crmApi, DateHelper) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.formatDate = CRM.utils.formatDate;
    $scope.templateExists = templateExists;
    $scope.formatDate = DateHelper.formatDate;
    $scope.isOverdue = DateHelper.isOverdue;

    $scope.isActivityEditable = function (activity) {
      var type = CRM.civicase.activityTypes[activity.activity_type_id].name;

      return (type !== 'Email' && type !== 'Print PDF Letter') && $scope.editActivityUrl;
    };

    /**
     * Mark an activity as complete
     *
     * @param {object} activity
     */
    $scope.markCompleted = function (activity) {
      return crmApi([['Activity', 'create', {id: activity.id, status_id: activity.is_completed ? 'Scheduled' : 'Completed'}]])
        .then(function (data) {
          if (!data[0].is_error) {
            activity.is_completed = !activity.is_completed;
          }
        });
    };

    /**
     * Toggle an activity as favourite
     *
     * @param {object} $event
     * @param {object} activity
     */
    $scope.toggleActivityStar = function ($event, activity) {
      $event.stopPropagation();
      activity.is_star = activity.is_star === '1' ? '0' : '1';
      // Setvalue api avoids messy revisioning issues
      $scope.refresh([['Activity', 'setvalue', {id: activity.id, field: 'is_star', value: activity.is_star}]], true);
    };

    /**
     * Delete an activity
     *
     * @param {object} activity
     * @param {jQuery} dialog - the dialog which should be closed once deletion is over
     */
    $scope.deleteActivity = function (activity, dialog) {
      CRM.confirm({
        title: ts('Delete Activity'),
        message: ts('Permanently delete this %1 activity?', {1: activity.type})
      })
        .on('crmConfirm:yes', function () {
          $scope.refresh([['Activity', 'delete', {id: activity.id}]]);
          if (dialog && $(dialog).data('uiDialog')) {
            $(dialog).dialog('close');
          }
        });
    };

    /**
     * View an activity details in the popup
     *
     * @param {object} $event
     * @param {object} activity
     */
    $scope.viewInPopup = function ($event, activity) {
      if (!$event || !$($event.target).is('a, a *, input, button, button *')) {
        var context = activity.case_id ? 'case' : 'activity';
        var form = CRM.loadForm(CRM.url('civicrm/activity', {action: 'view', id: activity.id, reset: 1, context: context}))
          .on('crmFormSuccess', function () {
            $scope.refresh();
          })
          .on('crmLoad', function () {
            $('a.delete.button').click(function () {
              $scope.deleteActivity(activity, form);

              return false;
            });
          });
      }
    };

    $scope.moveCopyActivity = function (act, op) {
      var model = {
        ts: ts,
        activity: _.cloneDeep(act)
      };
      dialogService.open('MoveCopyActCard', '~/civicase/ActivityMoveCopy.html', model, {
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: op === 'move' ? ts('Move %1 Activity', {1: act.type}) : ts('Copy %1 Activity', {1: act.type}),
        buttons: [{
          text: ts('Save'),
          icons: {primary: 'fa-check'},
          click: function () {
            if (op === 'copy') {
              delete model.activity.id;
            }
            if (model.activity.case_id && model.activity.case_id !== act.case_id) {
              $scope.refresh([['Activity', 'create', model.activity]]);
            }
            $(this).dialog('close');
          }
        }]
      });
    };

    /**
     * Gets attachments for an activity
     *
     * @param {object} activity
     */
    $scope.getAttachments = function (activity) {
      if (!activity.attachments) {
        activity.attachments = [];
        CRM.api3('Attachment', 'get', {
          entity_table: 'civicrm_activity',
          entity_id: activity.id,
          sequential: 1
        }).done(function (data) {
          activity.attachments = data.values;
          $scope.$digest();
        });
      }
    };
  }
})(angular, CRM.$, CRM._);
