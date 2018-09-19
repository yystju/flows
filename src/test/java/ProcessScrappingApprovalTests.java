

import static org.junit.Assert.assertNotNull;

import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.swing.JDialog;
import javax.swing.JPanel;
import javax.swing.JScrollPane;

import org.activiti.bpmn.model.BpmnModel;
import org.activiti.engine.history.HistoricActivityInstance;
import org.activiti.engine.history.HistoricProcessInstance;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.task.Task;
import org.activiti.engine.test.ActivitiRule;
import org.activiti.engine.test.Deployment;
import org.activiti.image.impl.DefaultProcessDiagramGenerator;
import org.junit.Rule;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProcessScrappingApprovalTests {
	private static Logger logger = LoggerFactory.getLogger(ProcessScrappingApprovalTests.class);

	@Rule
	public ActivitiRule activitiRule = new ActivitiRule("activiti.cfg.xml");

	@Test
	@Deployment(resources = { "diagrams/scrapping_approval.bpmn" })
	public void testApproved() throws Exception {
		DateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssX");

		activitiRule.getIdentityService().setAuthenticatedUserId("user1");
		activitiRule.setCurrentTime(fmt.parse("2018-01-01 00:00:00+08:00"));

		HashMap<String, Object> map = new HashMap<String, Object>();

		ProcessInstance processInstance = activitiRule.getRuntimeService().startProcessInstanceByKey("scrapping_approval_process", map);

		assertNotNull(processInstance);
		
		while(activitiRule.getRuntimeService().createProcessInstanceQuery().active().processInstanceId(processInstance.getId()).count() > 0) {
			progressDialog(processInstance);
			
			List<Task> tasks = activitiRule.getTaskService().createTaskQuery().active().processInstanceId(processInstance.getId()).list();

			for (Task task : tasks) {
				logger.info("TASK : {}", task.getName());

				activitiRule.getTaskService().claim(task.getId(), "hello");
				
				Map<String, Object> taskVariables = activitiRule.getTaskService().getVariables(task.getId());
				
				activitiRule.getTaskService().complete(task.getId(), taskVariables);
			}
			
			showHistory();
		}
	}
	
	private void progressDialog(ProcessInstance processInstance) throws IOException {
		InputStream imageStream = createInstanceDiagram(activitiRule, processInstance.getId());

		final BufferedImage img = ImageIO.read(imageStream);

		JDialog dialog = new JDialog();

		dialog.setSize(new Dimension(img.getWidth(), img.getHeight() + 20));

		dialog.add(new JScrollPane(new JPanel() {
			private static final long serialVersionUID = 8384963789529867205L;

			@Override
			protected void paintComponent(Graphics g) {
				g.drawImage(img, 0, 0, this);
			}
		}));

		dialog.setModal(true);
		dialog.setVisible(true);

		imageStream.close();
	}

	public InputStream createInstanceDiagram(ActivitiRule activitiRule, String processInstanceId) {
		DefaultProcessDiagramGenerator generator = new DefaultProcessDiagramGenerator(1.0);

		String definitionId = null;
		List<String> activities = null;

		ProcessInstance pi = activitiRule.getRuntimeService().createProcessInstanceQuery()
				.processInstanceId(processInstanceId).singleResult();

		if (pi == null) {
			HistoricProcessInstance hpi = activitiRule.getHistoryService().createHistoricProcessInstanceQuery()
					.processInstanceId(processInstanceId).singleResult();

			definitionId = hpi.getProcessDefinitionId();

			List<HistoricActivityInstance> htasks = activitiRule.getHistoryService()
					.createHistoricActivityInstanceQuery().processInstanceId(processInstanceId).orderByActivityId()
					.desc().list();

			activities = htasks.size() > 0 ? Arrays.asList(new String[] { htasks.get(0).getActivityId() })
					: Arrays.asList(new String[] {});
		} else {
			definitionId = activitiRule.getRepositoryService().createProcessDefinitionQuery()
					.processDefinitionKey(pi.getProcessDefinitionKey()).singleResult().getId();

			activities = activitiRule.getRuntimeService().getActiveActivityIds(processInstanceId);
		}

		BpmnModel model = activitiRule.getRepositoryService().getBpmnModel(definitionId);

		InputStream is = generator.generateDiagram(model, "png", activities);

		return is;
	}

	private void showHistory() {
		List<HistoricProcessInstance> historicProcessList = activitiRule.getHistoryService()
				.createHistoricProcessInstanceQuery().processDefinitionKey("isolation_review").list();

		for (HistoricProcessInstance history : historicProcessList) {
			logger.info(">>>> BUSINESSKEY : {}, END TIME : {}", history.getBusinessKey(), history.getEndTime());

			List<HistoricActivityInstance> htasks = activitiRule.getHistoryService()
					.createHistoricActivityInstanceQuery().processInstanceId(history.getId()).list();

			for (HistoricActivityInstance htask : htasks) {
				logger.info(">>>>> task : {}, assignee : {}", htask.getActivityName(), htask.getAssignee());
			}
		}
	}
}
