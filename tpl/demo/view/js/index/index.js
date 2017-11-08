$(() => {

	var data1 = {
			message: 'hello',
			content: '<h2>asgcjs</h2><p style="color:red;">这是一个示例程序</p>',
			url: 'http://imgsrc.baidu.com/imgad/pic/item/267f9e2f07082838b5168c32b299a9014c08f1f9.jpg'
		};

	var data2 = {
		flag: true,
		message: 'abcd'
	};

	var data3 = {

	};

	new Asgc([{
		scope: 'scope1',
		data: data1
	},{
		scope: 'scope2',
		data: data2
	}]);

	new Asgc({
		scope: 'scope3',
		data: {
			//color: 'red'
			color: '#0000ff'
		}
	});

	$('#btnReset').click(() => {
		data1.content = '<h2>asgcjs</h2><p style="color:red;">这是一个示例程序</p>';
		data1.message = 'hello'
	});

	$('#btnClick').click(() => {
		data2.flag = !data2.flag;
		data2.message = 'aoshiguchen'
	});

});