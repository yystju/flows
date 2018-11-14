

import static org.junit.Assert.assertNotNull;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
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

public class GeneralProcessTests {
	private static Logger logger = LoggerFactory.getLogger(GeneralProcessTests.class);

	@Rule
	public ActivitiRule activitiRule = new ActivitiRule("activiti.cfg.xml");

	@Test
	@Deployment(resources = { "diagrams/general_process.bpmn" })
	public void testScrapping() throws Exception {
		String script = new String(readAllBytes(GeneralProcessTests.class.getResourceAsStream("/scripts/general_process_test_scrapping.js")), StandardCharsets.UTF_8);
		
		System.setProperty("fake.data.preparation.script", script);
		
		DateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssX");

		activitiRule.getIdentityService().setAuthenticatedUserId("user1");
		activitiRule.setCurrentTime(fmt.parse("2018-01-01 00:00:00+08:00"));

		HashMap<String, Object> map = new HashMap<String, Object>();
		
		map.put("type", "scrapping");
		map.put("num", "60");

		ProcessInstance processInstance = activitiRule.getRuntimeService().startProcessInstanceByKey("general_process", map);

		assertNotNull(processInstance);
		
		while(activitiRule.getRuntimeService().createProcessInstanceQuery().active().processInstanceId(processInstance.getId()).count() > 0) {
			progressDialog(processInstance);
			
			List<Task> tasks = activitiRule.getTaskService().createTaskQuery().active().processInstanceId(processInstance.getId()).list();

			for (Task task : tasks) {
				logger.info("TASK : {}", task.getName());

				activitiRule.getTaskService().claim(task.getId(), "hello");
				
				Map<String, Object> taskVariables = activitiRule.getTaskService().getVariables(task.getId());
				
				taskVariables.put("approved", "true");
				
				activitiRule.getTaskService().complete(task.getId(), taskVariables);
			}
			
			showHistory();
		}
	}
	
	@Test
	@Deployment(resources = { "diagrams/general_process.bpmn" })
	public void testIsolation() throws Exception {
		String script = new String(readAllBytes(GeneralProcessTests.class.getResourceAsStream("/scripts/general_process_test_isolation.js")), StandardCharsets.UTF_8);
		
		System.setProperty("fake.data.preparation.script", script);
		
		DateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssX");

		activitiRule.getIdentityService().setAuthenticatedUserId("user1");
		activitiRule.setCurrentTime(fmt.parse("2018-01-01 00:00:00+08:00"));

		HashMap<String, Object> map = new HashMap<String, Object>();

		map.put("type", "isolation");
		
		ProcessInstance processInstance = activitiRule.getRuntimeService().startProcessInstanceByKey("general_process", map);

		assertNotNull(processInstance);
		
		while(activitiRule.getRuntimeService().createProcessInstanceQuery().active().processInstanceId(processInstance.getId()).count() > 0) {
			progressDialog(processInstance);
			
			List<Task> tasks = activitiRule.getTaskService().createTaskQuery().active().processInstanceId(processInstance.getId()).list();

			for (Task task : tasks) {
				logger.info("TASK : {}", task.getName());

				activitiRule.getTaskService().claim(task.getId(), "hello");
				
				Map<String, Object> taskVariables = activitiRule.getTaskService().getVariables(task.getId());
				
				taskVariables.put("approved", "true");
				
				activitiRule.getTaskService().complete(task.getId(), taskVariables);
			}
			
			showHistory();
		}
	}
	
	private byte[] readAllBytes(InputStream ins) throws IOException {
		ByteArrayOutputStream outs = new ByteArrayOutputStream();
		
		int len = -1;
		byte[] buff = new byte[1024 * 8];
		
		while(-1 != (len = ins.read(buff))) {
			outs.write(buff, 0, len);
		}
		
		return outs.toByteArray();
	}

	private void progressDialog(ProcessInstance processInstance) throws IOException {
		InputStream imageStream = createInstanceDiagram(activitiRule, processInstance.getId());

		final BufferedImage img = ImageIO.read(imageStream);

		JDialog dialog = new JDialog();

		dialog.setSize(new Dimension(img.getWidth(), img.getHeight() + 20));
		
		JPanel panel = new JPanel() {
			private static final long serialVersionUID = 8384963789529867205L;

			@Override
			protected void paintComponent(Graphics g) {
				g.drawImage(img, 0, 0, this);
			}
		};
		
		panel.setBackground(Color.WHITE);
		
		panel.setPreferredSize(new Dimension(img.getWidth(), img.getHeight() + 20));
		
		JScrollPane scrollPane = new JScrollPane(panel);

		dialog.add(scrollPane);

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
