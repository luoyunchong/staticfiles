**English** | [简体中文](question.md)

# question

Review workflow entity
~~~
  public class BackReason:Entity<long>,IHasCreationTime,ICreationAudited,IHasCreationUserName
    {
        public Guid Guid { get; set; }
        [StringLength(500)]
        public string Reasons { get; set; }
        [StringLength(50)]
        public string CreationUserName { get; set; }
        public DateTime CreationTime { get; set; }
        public long? CreatorUserId { get; set; }
    }

~~~
Corresponding BackReasonManager method
~~~
        private readonly IRepository<BackReason, long> _backReasonsRepository;
        public IAbpSession AbpSession { get; set; }

        public BackReasonManager(IRepository<BackReason, long> backReasonsRepository)
        {
            _backReasonsRepository = backReasonsRepository;
        }

        public void Insert(Guid guid, string reasons)
        {
            _backReasonsRepository.Insert(new BackReason()
            {
                Guid = guid,
                Reasons = reasons,
                CreationUserName = AbpSession.GetLoginName()
            });
        }

        public List<BackReason> GetBackReasonByGuid(Guid guid)
        {
            return _backReasonsRepository.GetAll().Where(r => r.Guid == guid).OrderByDescending(u => u.CreationTime).ToList();
        }

~~~
Controller data method
~~~
public ActionResult GetGridByCondition(Guid guid)
{
    var backlists = _backReasonManager.GetBackReasonByGuid(guid);

    return Json(new EasyUiListResultDto<BackReason>(backlists));
}
~~~

BackReasonController Index.csthml
~~~
@{
    Layout = null;
}
<div class="easyui-layout" data-options="fit:true">
    <div data-options="region:'center',border:false" style="overflow: hidden;">
        <table id="backReason-dgGrid"></table>
    </div>
</div>

<script>
    var backReasonUI = {};
    (function () {
        var dgGrid, dgGridId = '#backReason-dgGrid';
        var gridUrl = '/BackReason/GetGridByCondition';

        $.extend(backReasonUI,
            {
                loadGrid: function (guid) {
                    dgGrid = $(dgGridId).datagrid({
                        url: gridUrl,
                        queryParams: {
                            Guid: guid
                        },
                        pagination: false,
                        columns: [[
                            { field: 'Reasons', title: '原因', width: 200, tooltip: true },
                            { field: 'CreationUserName', title: '操作人', width: 80, tooltip: true },
                            { field: 'CreationTime', title: '操作时间', width: 100, tooltip: true }
                        ]]
                    });
                }
            });


    })();
    //gridUI.loadGrid(Guid);
</script>

~~~