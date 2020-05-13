import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  FlatList,
  Alert,
  TouchableOpacity,
  Picker,
  TextInput
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

// var [selectedValue, setSelectedValue] = useState("title");

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      api_data: [],
      data_backup: [],
      filter_by: 'title',
      search_by: 'title',
      page_no: 1,
      searched_text:'',
      searched_data:[]
    }
  }

  async componentDidMount() {
    this.getApiData(1);
    this.initializeInterval();
  }

  initializeInterval = () => {
    this.setApiInterval = setInterval(() => {
      this.setState({
        page_no: this.state.page_no + 1
      }, () => this.getApiData(this.state.page_no))
    }, 10000);
  }

  componentWillUnmount() {
    this.clearInitializedInterval();
  }

  getApiData(page_number) {

    return fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&page=' + page_number).
      then(res => res.json()).
      then(response => {
        // Alert.alert(JSON.stringify(response.hits));
        var mergeData = this.state.data_backup.concat(response.hits);
        this.setState({
          api_data: mergeData,
          data_backup: mergeData
        });
        return response;
      }).catch((error) => {
        console.log(error);
      });

  }

  clearInitializedInterval = () => {
    clearInterval(this.setApiInterval);
  }

  renderRow = ({ item }) => {
    return (
      <TouchableOpacity style={{ flexDirection: "column", margin: 5, padding: 5, backgroundColor: '#1ACAFE', borderRadius: 5 }}
        onPress={() => Alert.alert('', JSON.stringify(item))}
      >
        <Text style={styles.itemstyle}>{'Title : ' + item.title}</Text>
        <Text style={styles.itemstyle}>{'Author : ' + item.author}</Text>
        <Text style={styles.itemstyle}>{'URL : ' + item.url}</Text>
        <Text style={styles.itemstyle}>{'Created At : ' + item.created_at}</Text>
      </TouchableOpacity>
    )
  }

  listEndReached = () => {
    this.clearInitializedInterval();
    this.setState({
      page_no: this.state.page_no + 1
    },
      () => {
        this.getApiData(this.state.page_no);
        this.initializeInterval();
      }
    )
  }

  filterData = (filter_type) =>{
    var duplicateData = this.state.data_backup;
    var filtered_list = duplicateData.sort((a,b)=>{

      if(filter_type.includes('title')){
        return a.title > b.title ? 1 : -1
      }
      else{
        // console.log("filter by created at"+filter_by)
        return a.created_at > b.created_at ? 1 : -1
      }
      
    })

    this.setState({
      api_data: filtered_list
    })
  }

  searchData = (search_type, search_text) =>{

    if(search_text != ''){
      var duplicateData = this.state.data_backup;
    var filtered_data = duplicateData.filter((item)=>{

      if(search_type.includes('title') && item.title != null){
       
          return item.title.toLowerCase().includes(search_text.toLowerCase())
      }
      else if(search_type.includes('author') && item.author != null){
        console.log("author" + item.title)

        return item.author.toLowerCase().includes(search_text.toLowerCase())
      }else if(item.url != null){
        console.log("else" + item.title)
        return item.url.toLowerCase().includes(search_text.toLowerCase())
      }
    })
    }
    else{
     var filtered_data = []
    }
    

    this.setState({
      searched_data: filtered_data
    })

  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ textAlign: "center" }}>{'Page Number : ' + this.state.page_no}</Text>
        <View style={{ flexDirection: "row" }}>
          <Picker
        selectedValue={this.state.filter_by}
        style={{ flex: 2, alignSelf: "center" }}
            onValueChange={(itemvalue, itemindex) => {
              this.setState({ filter_by: itemvalue });
            }}
          >
            {/* <Picker.Item label="None" value="none" /> */}
            <Picker.Item label="title" value="title" />
            <Picker.Item label="created At" value="created_at" />
          </Picker>

          <TouchableOpacity
            style={{ margin: 5, flex: 1, justifyContent: "center" }}
            onPress={()=>this.filterData(this.state.filter_by)}
          >
            <Text style={{ color: '#1ACAFE', fontSize: 15, borderRadius: 10, borderWidth: 1, borderColor: '#1ACAFE', padding: 10, textAlign: "center" }}>
              Filter
  </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row" }}>
          <Picker
        selectedValue={this.state.search_by}
        style={{ flex: 1, alignSelf: "center" }}
            onValueChange={(itemvalue, itemindex) => {
              this.setState({ search_by: itemvalue });
            }}
          >
            {/* <Picker.Item label="None" value="none" /> */}
            <Picker.Item label="title" value="title" />
            <Picker.Item label="Author" value="author" />
            <Picker.Item label="URL" value="url" />
          </Picker>
          <TextInput
          style={{flex:2, borderWidth:1, borderColor:'#1ACAFE', borderRadius:10,margin:5}}
          placeholder='search...'
          onChangeText={(value)=>{
            this.setState({
              searched_text: value
            },
            ()=>this.searchData(this.state.search_by, this.state.searched_text))
          }}
          // value={this.state.searched_text}
          >

          </TextInput>

          {/* <TouchableOpacity
            style={{ margin: 5, flex: 1, justifyContent: "center" }}
            onPress={()=>this.searchData(this.state.search_by, this.state.searched_text)}
          >
            <Text style={{ color: '#1ACAFE', fontSize: 15, borderRadius: 10, borderWidth: 1, borderColor: '#1ACAFE', padding: 10, textAlign: "center" }}>
              Search
  </Text>
          </TouchableOpacity> */}
        </View>

        <FlatList
          keyExtractor={(item, index) => index}
          ref={ref => this.flatList = ref}
          data={this.state.searched_data == ''? this.state.api_data:this.state.searched_data}
          style={{ flex: 1, width: '100%' }}
          renderItem={(item) => this.renderRow(item)}
          onEndReached={() => this.listEndReached()}
        // onEndReachedThreshold={0.1}
        // onMomentumScrollEnd={()=>this.listEndReached()}
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  itemstyle: {
    margin: 2,
    color: '#ffffff',
    fontSize: 18
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
